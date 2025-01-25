const express = require("express");
const fs = require("fs");
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const Joi = require('joi');
require('dotenv').config();
const { v4: uuidv4 } = require("uuid");
const { chkFile, appendFileData, getFileData, addFileData } = require("../utils/helper");
const ENUMS = require("../utils/AllVariable");

const TodoSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() }, // Ensure each call generates a new UUID
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date },
    id: { type: String, default: () => uuidv4() }, // Explicitly provide a unique value for 'id' if required
});


const TodoModel = mongoose.model('todos', TodoSchema);

router.post("/todo/add", async (req, res) => {
    const data_to_add = req.body;

    const Schema = Joi.object({
        title: Joi.string().min(1).required(),
        description: Joi.string().min(1).required(),
    })

    const validate = Schema.validate(data_to_add)

    if (validate.error) {
        return res.status(400).json({ message: validate.error.message })
    }

    const createdBy = req.user.id
    const data = { ...req.body, id: uuidv4(), createdBy, createdAt: new Date() };

    const newTodo = new TodoModel(data);
    await newTodo.save();

    res.json({ message: "todo Added" })
})

router.get("/todo/mytodo", async (req, res) => {
    const data = await TodoModel.find();
    const todoData = data.filter((d) => d.createdBy === req.user.id);
    res.json({ data: todoData });
})

router.delete("/todo/delete/:id", async (req, res) => {
    const todoid = req.params.id;
    const currentUser = req.user.id;

    try {
        const deletedTodo = await TodoModel.deleteOne({ id: todoid, createdBy: currentUser });
        console.log(deletedTodo);

        if (deletedTodo.deletedCount === 0) {
            return res.status(404).json({ message: "Todo not found or you do not have permission to delete this todo." });
        }

        res.json({ message: "Todo deleted successfully." });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred while deleting the todo." });
    }
});

router.put("/todo/update/:id", async (req, res) => {
    const todoId = req.params.id;
    const currentUser = req.user.id;

    const Schema = Joi.object({
        title: Joi.string().min(1).required(),
        description: Joi.string().min(1).required(),
    });

    const validate = Schema.validate(req.body);

    if (validate.error) {
        return res.status(400).json({ message: validate.error.message });
    }

    try {
        const updatedTodo = await TodoModel.findOneAndUpdate(
            { id: todoId, createdBy: currentUser },
            { ...req.body, lastModifiedAt: new Date() },
            { new: true } // Return the updated document
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: "Todo not found or you do not have permission to update this todo.",
            });
        }

        res.json({ message: "Todo updated successfully.", updatedTodo });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred while updating the todo." });
    }
});

const chatroutes = router
module.exports = { chatroutes }