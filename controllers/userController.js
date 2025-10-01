import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const latestPlan =
      user.plans.length > 0 ? user.plans[user.plans.length - 1] : null;

    res.json({
      name: user.name,
      email: user.email,
      city: user.city,
      paymentStatus: user.paymentStatus || "Not Paid",
      plan: latestPlan ? latestPlan.planName : null,
      paymentAmount: latestPlan ? latestPlan.amount : null,
      planDuration: latestPlan ? latestPlan.duration : null,
      planStartDate: latestPlan ? latestPlan.purchasedAt : null,
      planEndDate: latestPlan
        ? new Date(
            new Date(latestPlan.purchasedAt).setMonth(
              new Date(latestPlan.purchasedAt).getMonth() +
                latestPlan.duration
            )
          )
        : null,
      avatar: user.avatar || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: error.message });
  }
};
