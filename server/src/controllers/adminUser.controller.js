const adminUserService = require("../services/adminUser.service");

const getUsers = async (req, res) => {
    try {
        const users = await adminUserService.getAllUsers(
            req.query
        );


        res.status(200).json({
            success: true,
            data: users,
        });


    } catch (error) {
        console.error("Get users error:", error);


        res.status(500).json({
            success: false,
            message: error.message || "Failed to get users",
        });


    }
};

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
        } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters",
            });
        }

        const user = await adminUserService.createUser({
            name,
            email,
            password,
            role: role || "TEAM_MEMBER",
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });


    } catch (error) {
        console.error("Create user error:", error);


        res.status(400).json({
            success: false,
            message: error.message || "Failed to create user",
        });


    }
};

const updateUser = async (req, res) => {
    try {
        const user = await adminUserService.updateUser(
            req.params.id,
            req.body,
            req.user._id
        );


        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });


    } catch (error) {
        console.error("Update user error:", error);


        res.status(400).json({
            success: false,
            message: error.message || "Failed to update user",
        });


    }
};

const deactivateUser = async (req, res) => {
    try {
        const user =
        await adminUserService.deactivateUser(
            req.params.id,
            req.user._id
        );


        res.status(200).json({
            success: true,
            message: "User deactivated successfully",
            data: user,
        });


    } catch (error) {
        console.error(
            "Deactivate user error:",
            error
        );


        res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to deactivate user",
        });


    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deactivateUser,
};