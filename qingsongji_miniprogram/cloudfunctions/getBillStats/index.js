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
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999)
    
    // 查询当月账单
    const result = await db.collection('bills')
      .where({
        userId: wxContext.OPENID,
        date: db.command.gte(firstDay).and(db.command.lte(lastDay))
      })
      .get()
    
    const bills = result.data
    
    // 计算统计数据
    let income = 0
    let expense = 0
    
    bills.forEach(bill => {
      if (bill.type === 'income') {
        income += bill.amount
      } else if (bill.type === 'expense') {
        expense += bill.amount
      }
    })
    
    const balance = income - expense
    const total = bills.length
    
    // 按分类统计支出
    const categoryStats = {}
    bills.filter(bill => bill.type === 'expense').forEach(bill => {
      const category = bill.category
      if (!categoryStats[category]) {
        categoryStats[category] = 0
      }
      categoryStats[category] += bill.amount
    })
    
    return {
      code: 200,
      message: '查询成功',
      data: {
        income,
        expense,
        balance,
        total,
        categoryStats,
        year,
        month
      }
    }
    
  } catch (error) {
    console.error('查询统计数据失败:', error)
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    }
  }
}
