const router = require('koa-router')()
const util = require('../utils/util')
const Leave = require('../models/leaveSchema')
const Dept = require('../models/deptSchema')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
router.prefix('/leave')
router.get('/count1', async (ctx) => {
    console.log(ctx)
    let authorization = ctx.request.headers.authorization
    let { data } = util.decoded(authorization)
    try {
      let params = {}
      params.curAuditUserName = data.userName;
      params.$or = [{ applyState: 1}, {applyState: 2}]
      const total = await Leave.countDocuments(params)
      ctx.body = util.success(total)
    } catch (error) {
        console.log(error)
      ctx.body = util.fail(`查询异常：${error.message}`)
    }
  })

router.get('/list', async (ctx) => {
    const {applyState, type} = ctx.request.query
    let authorization = ctx.request.headers.authorization
    const {page, skipIndex} = util.pager(ctx.request.query)
    let {data} = util.decoded(authorization)
    try {
        let params = {}

        if (type == 'approve') {
            if (applyState == 1 || applyState == 2) {
                params.curAuditUserName = data.userName
                params.$or = [{applyState: 1}, {applyState: 2}]
            } else if (applyState > 2) {
                params = {"auditFlows.userId": data.userId, applyState}
            } else {
                params = {"auditFlows.userId": data.userId}
            }
        } else {
            params = {
                "applyUser.userId": data.userId
            }
            if (applyState) params.applyState = applyState
        }
        const query =   Leave.find(params)
        const list = await query.skip(skipIndex).limit(page.pageSize)
        const total = await Leave.countDocuments(params)
        ctx.body = util.success({
            page: {
                ...page,
                total,
            },
            list
        })
    } catch (error) {
        ctx.body = util.fail(`查询失败${error.stack}`)
    }
})

router.post('/operate', async (ctx) => {
    const {_id,action, ...params} = ctx.request.body
    let authorization = ctx.request.headers.authorization
    let {data} = util.decoded(authorization)
    if (action == 'create') {
        let orderNo = 'XJ'
        orderNo += util.formateDate(new Date(), 'yyyyMMdd')

        const total = await Leave.countDocuments()
        params.orderNo = orderNo + total
        // 获取当前部门id
        let id = data.deptId.pop()
        // 查找负责人信息
        let dept = await Dept.findById(id)

        // 获取人事部门 和 财务部门负责人信息
        let userList = await Dept.find({ deptName: {$in: ['人事','财务']}})

        let auditUsers = dept.userName
        let curAuditUserName = dept.userName
        let auditFlows = [{
            userId: dept.userId,
            userName: dept.userName,
            userEmail: dept.userEmail
        }]
        userList.map(item => {
            auditFlows.push({
               userId: item.userId,
               userNameL: item.userName,
               userEmail: item.userEmail 
            })
            auditUsers += ',' + item.userName
        })
        params.auditUsers = auditUsers
        params.curAuditUserName = curAuditUserName
        params.auditFlows = auditFlows
        params.auditLogs = []
        params.applyUser = {
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail
        }
        let res = await Leave.create(params)
        ctx.body = util.success("", '创建成功')
    } else {
        let res = Leave.findByIdAndUpdate(_id, {applyState: 5})
        ctx.body = util.success("", '操作成功')
    }
})

router.post('/approve', async (ctx) => {
    console.log(ctx)
    const {action, remark, _id} = ctx.request.body
    let authorization = ctx.request.headers.authorization
    let {data} = util.decoded(authorization)

    let doc = await Leave.findById(_id)

    let auditLogs = doc.auditLogs || []
    let params = {}

    if (action == 'refuse') {
        params.applyState = 3
    } else {
        if (doc.auditFlows.length === doc.auditLogs.length) {
            ctx.body = util.success('当前申请已经处理了')
            return 
        } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
            params.applyState = 4
        } else if (doc.auditFlows.length > Document.auditLogs.length) {
            params.applyState = 2
            params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName
        }
    }

    auditLogs.push({
        userId: data.userId,
        userName: data.userName,
        createTime: new Date(),
        remark,
        action: action == 'refuse' ? '审核拒绝' : '审核通过'
    })
    params.auditLogs = auditLogs

    await Leave.findByIdAndUpdate(_id, params)

    ctx.body = util.success('', '处理成功')
})
module.exports = router