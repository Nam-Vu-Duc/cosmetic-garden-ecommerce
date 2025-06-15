const express = require('express')
const router = express.Router()
const chatEmpController = require('../../app/controllers/admin/chatEmpController')

router.get('/'                  , chatEmpController.allChats)
router.get('/:id'               , chatEmpController.chatInfo)
router.post('/create'           , chatEmpController.chatCreated)
router.post('/get-last-message' , chatEmpController.chatLastMessage)

router.get('/data/chats'        , chatEmpController.getChats)
router.get('/data/user'         , chatEmpController.getUser)

module.exports = router