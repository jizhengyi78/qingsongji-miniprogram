// pages/stats/stats.js
const app = getApp()

Page({
  data: {
    currentMonth: '',
    stats: null,
    categoryStats: [],
    categoryChart: {}
  },

  onLoad() {
    // 初始化月份
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    
    this.setData({
      currentMonth: `${year}-${month}`
    }, () => {
      this.loadStats()
    })
  },

  onShow() {
    this.loadStats()
  },

  // 加载统计数据
  async loadStats() {
    wx.showLoading({
      title: '加载中...'
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'getBillStats',
        data: {
          month: this.data.currentMonth
        }
      })

      wx.hideLoading()

      if (result.result.code === 200) {
        const stats = result.result.data
        const categoryStats = this.processCategoryStats(stats.categoryStats)
        
        this.setData({
          stats,
          categoryStats
        }, () => {
          this.renderCategoryChart()
        })
      } else {
        wx.showToast({
          title: result.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('加载统计数据失败', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    }
  },

  // 处理分类统计数据
  processCategoryStats(categoryStats) {
    const categories = app.globalData.categories
    const result = []
    let totalExpense = 0
    
    // 计算总支出
    Object.values(categoryStats).forEach(amount => {
      totalExpense += amount
    })
    
    // 转换为数组并计算百分比
    for (const [category, amount] of Object.entries(categoryStats)) {
      const categoryInfo = categories.find(c => c.id === category)
      if (categoryInfo && amount > 0) {
        result.push({
          category,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          amount,
          percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
        })
      }
    }
    
    // 按金额排序
    return result.sort((a, b) => b.amount - a.amount)
  },

  // 渲染分类图表
  renderCategoryChart() {
    if (!this.data.categoryStats || this.data.categoryStats.length === 0) {
      return
    }

    const chartData = this.data.categoryStats.map(item => ({
      name: item.name,
      value: item.amount
    }))

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
      },
      series: [{
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        }
      }],
      color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
    }

    this.setData({
      categoryChart: {
        onInit: function(canvas, width, height, dpr) {
          const chart = require('../../utils/echarts').init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          })
          canvas.setChart(chart)
          chart.setOption(option)
          return chart
        }
      }
    })
  },

  // 月份选择
  onMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value
    }, () => {
      this.loadStats()
    })
  },

  // 格式化月份显示
  formatMonth(monthStr) {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  },

  // 获取分类图标
  getCategoryIcon(categoryId) {
    const categories = app.globalData.categories
    const category = categories.find(item => item.id === categoryId)
    return category ? category.icon : '📝'
  },

  // 获取分类名称
  getCategoryName(categoryId) {
    const categories = app.globalData.categories
    const category = categories.find(item => item.id === categoryId)
    return category ? category.name : '其他'
  }
})
