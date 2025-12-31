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
    const { type, category, amount, account, date, note } = event
    
    if (!type || !category || amount === undefined || amount === null) {
      return {
        code: 400,
        message: '参数不完整'
      }
    }
    
    if (!['income', 'expense'].includes(type)) {
      return {
        code: 400,
        message: '类型参数错误'
      }
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return {
        code: 400,
        message: '金额必须是正数'
      }
    }
    
    // 数据格式化
    const billData = {
      _id: generateId(),
      userId: wxContext.OPENID,
      type: type,
      category: category,
      amount: Number(amount),
      account: account || 'cash',
      date: date ? new Date(date) : new Date(),
      note: note || '',
      createTime: new Date(),
      updateTime: new Date(),
      year: new Date(date || Date.now()).getFullYear(),
      month: new Date(date || Date.now()).getMonth() + 1,
      day: new Date(date || Date.now()).getDate()
    }
    
    // 写入数据库
    await db.collection('bills').add({
      data: billData
    })
    
    return {
      code: 200,
      message: '添加成功',
      data: billData
    }
    
  } catch (error) {
    console.error('添加账单失败:', error)
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}
