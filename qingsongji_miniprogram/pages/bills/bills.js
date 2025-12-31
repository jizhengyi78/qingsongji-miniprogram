// pages/bills/bills.js
const app = getApp()

Page({
  data: {
    billList: [],
    summary: {
      income: 0,
      expense: 0,
      balance: 0,
      total: 0
    },
    filterType: 'all', // all, expense, income
    searchText: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false
  },

  onLoad() {
    this.loadBills()
    this.loadSummary()
  },

  onShow() {
    // 刷新数据
    this.setData({
      page: 1,
      billList: []
    }, () => {
      this.loadBills()
      this.loadSummary()
    })
  },

  // 加载账单列表
  async loadBills(isLoadMore = false) {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getBills',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          type: this.data.filterType !== 'all' ? this.data.filterType : null,
          search: this.data.searchText || null
        }
      })

      if (result.result.code === 200) {
        const { list, total } = result.result.data
        const hasMore = list.length >= this.data.pageSize
        
        this.setData({
          billList: isLoadMore ? [...this.data.billList, ...list] : list,
          hasMore,
          isLoading: false
        })
      } else {
        this.setData({ isLoading: false })
        wx.showToast({
          title: result.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载账单失败', error)
      this.setData({ isLoading: false })
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    }
  },

  // 加载汇总数据
  async loadSummary() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getBillStats',
        data: {
          date: new Date().getTime()
        }
      })

      if (result.result.code === 200) {
        this.setData({
          summary: result.result.data
        })
      }
    } catch (error) {
      console.error('加载统计数据失败', error)
    }
  },

  // 切换筛选类型
  switchFilter(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      filterType: type,
      page: 1,
      billList: []
    }, () => {
      this.loadBills()
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value,
      page: 1,
      billList: []
    })
    
    // 防抖处理
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.loadBills()
    }, 500)
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.isLoading) return
    
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadBills(true)
    })
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
  },

  // 格式化日期
  formatDate(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = new Date(today.getTime() - 86400000).toDateString() === date.toDateString()
    
    if (isToday) {
      return `今天 ${hour}:${minute}`
    } else if (isYesterday) {
      return `昨天 ${hour}:${minute}`
    } else {
      return `${year}-${month}-${day} ${hour}:${minute}`
    }
  },

  // 显示操作菜单
  showActions(e) {
    const bill = e.currentTarget.dataset.item
    const itemList = ['编辑', '删除']
    
    wx.showActionSheet({
      itemList,
      success: (res) => {
        if (res.tapIndex === 0) {
          this.editBill(bill)
        } else if (res.tapIndex === 1) {
          this.deleteBill(bill._id)
        }
      }
    })
  },

  // 编辑账单
  editBill(bill) {
    wx.showModal({
      title: '编辑账单',
      editable: true,
      placeholderText: bill.note || '请输入备注',
      success: async (res) => {
        if (res.confirm && res.content !== bill.note) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'updateBill',
              data: {
                id: bill._id,
                note: res.content
              }
            })

            if (result.result.code === 200) {
              wx.showToast({
                title: '更新成功',
                icon: 'success'
              })
              this.loadBills()
            } else {
              wx.showToast({
                title: result.result.message || '更新失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('更新账单失败', error)
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 删除账单
  deleteBill(billId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条账单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'deleteBill',
              data: { id: billId }
            })

            if (result.result.code === 200) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadBills()
              this.loadSummary()
            } else {
              wx.showToast({
                title: result.result.message || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除账单失败', error)
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
