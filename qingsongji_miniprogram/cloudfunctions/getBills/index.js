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
    const { page = 1, pageSize = 20, type, search } = event
    
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return {
        code: 400,
        message: '分页参数错误'
      }
    }
    
    // 构建查询条件
    const where = {
      userId: wxContext.OPENID
    }
    
    if (type && ['income', 'expense'].includes(type)) {
      where.type = type
    }
    
    if (search && search.trim()) {
      where.note = db.RegExp({
        regexp: search.trim(),
        options: 'i'
      })
    }
    
    // 查询总数
    const countResult = await db.collection('bills')
      .where(where)
      .count()
    
    const total = countResult.total
    
    // 查询数据
    const result = await db.collection('bills')
      .where(where)
      .orderBy('date', 'desc')
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      code: 200,
      message: '查询成功',
      data: {
        list: result.data,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total
      }
    }
    
  } catch (error) {
    console.error('查询账单失败:', error)
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    }
  }
}
