require('dotenv').config()
const express = require('express')
const router = express.Router()
const chat = require('../../app/models/chatModel')
const message = require('../../app/models/messageModel')

router.use(express.json())
router.get('/:id', async function(req, res) {
  const chatRoom = await chat.findOne({ userId: req.params.id }).lean()
  if (!chatRoom) return res.json({data: []})

  const chatMessages = await message.find({ chatId: chatRoom._id }).sort({createdAt: 1}).lean()
  return res.json({data: chatMessages})
})
router.post('/create', async function(req, res) {
  const chatRoom = await chat.findOne({ userId: req.cookies.uid }).lean()
  const newMessage = new message({
    chatId: chatRoom._id,
    senderId: req.cookies.uid,
    content: req.body.value
  })
  await chat.updateOne({_id: chatRoom._id}, {
    updatedAt: new Date(),
    lastMessage: req.body.value
  })
  await newMessage.save()
  return res.json({message: 'save successfully'})
})

module.exports = router