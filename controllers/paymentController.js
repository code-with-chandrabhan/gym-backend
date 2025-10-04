import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, months, totalAmount, userId } = req.body;
    const FRONTEND_URL_DEV = process.env.FRONTEND_URL_DEV;

    if (!plan || !months || !totalAmount || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let success_path = "/";
    switch (plan.name) {
      case "Basic Plan":
        success_path = "/plan/success/basic";
        break;
      case "Premium Plan":
        success_path = "/plan/success/premium";
        break;
      case "Personal Training":
        success_path = "/plan/success/personal";
        break;
      case "Group Classes":
        success_path = "/plan/success/group";
        break;
      default:
        success_path = "/pricing";
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: plan.features.join(", "),
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL_DEV}${success_path}?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&planName=${plan.name}&duration=${months}&amount=${totalAmount}`,
      cancel_url: `${FRONTEND_URL_DEV}/pricing`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { session_id, userId, planName, duration, amount } = req.body;

    if (!session_id || !userId || !planName || !duration || !amount) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.json({ success: false, message: "Payment not completed" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    const latestPlan =
      user.plans.length > 0 ? user.plans[user.plans.length - 1] : null;

    if (latestPlan) {
      const planEnd = new Date(latestPlan.purchasedAt);
      planEnd.setMonth(planEnd.getMonth() + latestPlan.duration);

      if (planEnd > now && latestPlan.planName === planName) {
        latestPlan.duration += Number(duration);
        latestPlan.amount += Number(amount);
        latestPlan.purchasedAt = new Date(latestPlan.purchasedAt);
      } else {
        user.plans.push({
          planName,
          duration: Number(duration),
          amount: Number(amount),
          purchasedAt: new Date(),
        });
      }
    } else {
      user.plans.push({
        planName,
        duration: Number(duration),
        amount: Number(amount),
        purchasedAt: new Date(),
      });
    }

    user.paymentStatus = "Paid";
    await user.save();

    return res.json({ success: true, user });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
