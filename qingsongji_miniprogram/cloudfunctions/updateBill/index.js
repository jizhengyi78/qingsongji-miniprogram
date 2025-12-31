// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    // 参数验证
    const { id, note } = event
    
    if (!id) {
      return {
        code: 400,
        message: '账单ID不能为空'
      }
    }
    
    if (note === undefined || note === null) {
      return {
        code: 400,
        message: '备注不能为空'
      }
    }
    
    // 更新数据
    const updateData = {
      note: note.trim(),
      updateTime: new Date()
    }
    
    const result = await db.collection('bills')
      .where({
        _id: id,
        userId: wxContext.OPENID // 确保只能更新自己的数据
      })
      .update({
        data: updateData
      })
    
    if (result.stats.updated === 0) {
      return {
        code: 404,
        message: '账单不存在或无权限'
      }
    }
    
    return {
      code: 200,
      message: '更新成功'
    }
    
  } catch (error) {
    console.error('更新账单失败:', error)
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    }
  }
}
