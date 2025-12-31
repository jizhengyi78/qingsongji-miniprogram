// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    stats: null
  },

  onLoad() {
    this.loadUserStats()
  },

  onShow() {
    this.loadUserStats()
  },

  // 加载用户统计信息
  async loadUserStats() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getBills',
        data: {
          page: 1,
          pageSize: 1
        }
      })

      if (result.result.code === 200) {
        const totalBills = result.result.data.total
        
        // 获取本月账单数
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const monthResult = await wx.cloud.callFunction({
          name: 'getBills',
          data: {
            page: 1,
            pageSize: 1000
          }
        })
        
        const thisMonthBills = monthResult.result.data.list.filter(bill => 
          new Date(bill.date) >= monthStart
        ).length
        
        // 计算记账天数（粗略估计）
        const totalDays = Math.ceil(totalBills / 2) // 假设每天记账2笔
        
        this.setData({
          stats: {
            totalBills,
            thisMonthBills,
            totalDays
          }
        })
      }
    } catch (error) {
      console.error('加载用户统计失败', error)
    }
  },

  // 数据导出
  exportData() {
    wx.showLoading({
      title: '生成中...'
    })

    wx.cloud.callFunction({
      name: 'getBills',
      data: {
        page: 1,
        pageSize: 10000
      }
    }).then(result => {
      wx.hideLoading()
      
      if (result.result.code === 200) {
        const bills = result.result.data.list
        const csvContent = this.generateCSV(bills)
        this.saveCSVFile(csvContent)
      } else {
        wx.showToast({
          title: result.result.message || '导出失败',
          icon: 'none'
        })
      }
    }).catch(error => {
      wx.hideLoading()
      console.error('导出数据失败', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    })
  },

  // 生成CSV内容
  generateCSV(bills) {
    const categories = app.globalData.categories
    
    // CSV表头
    let csv = '日期,类型,分类,金额,账户,备注\n'
    
    // 添加数据行
    bills.forEach(bill => {
      const date = new Date(bill.date).toLocaleDateString()
      const type = bill.type === 'income' ? '收入' : '支出'
      const category = categories.find(c => c.id === bill.category)?.name || '其他'
      const amount = bill.amount
      const account = this.getAccountName(bill.account)
      const note = bill.note || ''
      
      csv += `${date},${type},${category},${amount},${account},${note}\n`
    })
    
    return csv
  },

  // 获取账户名称
  getAccountName(accountId) {
    const accountMap = {
      'cash': '现金',
      'alipay': '支付宝',
      'wechat': '微信',
      'card': '银行卡'
    }
    return accountMap[accountId] || accountId
  },

  // 保存CSV文件
  saveCSVFile(content) {
    const fs = wx.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/账单导出.csv`
    
    try {
      fs.writeFileSync(filePath, content, 'utf8')
      
      // 保存到相册
      wx.saveFileToDisk({
        filePath: filePath,
        success: () => {
          wx.showToast({
            title: '导出成功',
            icon: 'success'
          })
        },
        fail: () => {
          // 如果保存到相册失败，尝试打开文档
          wx.openDocument({
            filePath: filePath,
            fileType: 'csv',
            success: () => {
              wx.showToast({
                title: '请在微信中查看文件',
                icon: 'none'
              })
            },
            fail: () => {
              wx.showToast({
                title: '导出失败',
                icon: 'none'
              })
            }
          })
        }
      })
    } catch (error) {
      console.error('保存文件失败', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 云端备份
  backupData() {
    wx.showModal({
      title: '云端备份',
      content: '确定要备份当前数据到云端吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '备份中...'
          })

          wx.cloud.callFunction({
            name: 'getBills',
            data: {
              page: 1,
              pageSize: 10000
            }
          }).then(result => {
            if (result.result.code === 200) {
              const bills = result.result.data.list
              
              // 保存到云存储
              const content = JSON.stringify({
                bills,
                backupTime: new Date().toISOString(),
                version: '1.0.0'
              })
              
              const fileName = `backup_${Date.now()}.json`
              
              wx.cloud.uploadFile({
                cloudPath: `backups/${wx.getStorageSync('userInfo')?.nickName || 'user'}/${fileName}`,
                fileContent: content,
                success: () => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '备份成功',
                    icon: 'success'
                  })
                },
                fail: (error) => {
                  wx.hideLoading()
                  console.error('备份失败', error)
                  wx.showToast({
                    title: '备份失败',
                    icon: 'none'
                  })
                }
              })
            } else {
              wx.hideLoading()
              wx.showToast({
                title: result.result.message || '备份失败',
                icon: 'none'
              })
            }
          }).catch(error => {
            wx.hideLoading()
            console.error('备份失败', error)
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  // 恢复数据
  restoreData() {
    wx.showModal({
      title: '恢复数据',
      content: '此功能需要手动选择备份文件，是否继续？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '请前往云开发控制台恢复',
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },

  // 显示关于信息
  showAbout() {
    wx.showModal({
      title: '关于轻松记',
      content: '轻松记 v1.0.0\n\n一款轻量级个人记账工具\n帮助您轻松管理财务\n\n© 2025 轻松记团队',
      showCancel: false
    })
  }
})
