const { User } =  require('../models/User');
const { passport } = require('../config/passport');

// Local Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Please fill in all fields." });
        }

        // Check if user already exists
        let user = await User.findOne(
            { $or: [{ email }, { name }] }
         );

        if (user) {
            return res
                .status(400)
                .json({ message: "User already exists." });
        }

        // Create new user
        user = await User.create({ name, email, password });

        // Auto login after registration
        req.login(user, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ message: "Auto-login failed." });
            }

            return res.status(201).json({
                message: "Registration successful.",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            });
        });
    } catch (error) {
        res
        .status(500)
        .json({ message: "Something went wrong.", error });
    }
};

// Local Login
const loginUser = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res
                .status(400)
                .json({ message: info.message || "Invalid credentials." });
        }

        req.login(user, (err) => {
            if (err) return next(err);

            return res.json({
                message: "Login successful.",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            });
        });
    })(req, res, next);
};

// Logout
const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Logout failed. Try again." });
        }

        res.json({ message: "Logged out successfully." });
    });
};

module.exports = { registerUser, loginUser, logoutUser };