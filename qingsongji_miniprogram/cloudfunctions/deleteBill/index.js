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
    const { id } = event
    
    if (!id) {
      return {
        code: 400,
        message: '账单ID不能为空'
      }
    }
    
    // 删除数据
    const result = await db.collection('bills')
      .where({
        _id: id,
        userId: wxContext.OPENID // 确保只能删除自己的数据
      })
      .remove()
    
    if (result.stats.removed === 0) {
      return {
        code: 404,
        message: '账单不存在或无权限'
      }
    }
    
    return {
      code: 200,
      message: '删除成功'
    }
    
  } catch (error) {
    console.error('删除账单失败:', error)
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    }
  }
}
