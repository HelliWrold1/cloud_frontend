<template>
  <div class="app-container">
    <div class="search-container">
      <el-input class="el-input-username" v-model="username" placeholder="输入用户名" clearable></el-input>
      <el-button class="el-button-search" @click="search" type="primary">搜索</el-button>
      <el-button class="el-button-clear" @click="clearSearchData" plain>清除搜索结果</el-button>
    </div>

    <div class="register-container">
      <el-input class="el-input-username" v-model="newUsername" placeholder="输入用户名" clearable></el-input>
      <el-input class="el-input-username" v-model="newPassword" placeholder="输入密码" clearable></el-input>
      <el-button class="el-button-search" @click="register" type="primary">注册</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" width="auto" element-loading-text="Loading" border
      highlight-current-row class="el-table-frame" page-size="pageSize">
      <el-table-column label="Username" sortable="custom" prop="username" align="center" width="auto">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="Operation" align="center" width="auto">
        <template slot-scope="scope">
          <el-button class="edit-button" type="primary" size="mini" v-permission="'admin'"
            @click="handleEdit(scope.row.id, scope.row.username)">
            修改密码
          </el-button>
          <el-button class="delete-button" type="danger" size="mini" v-permission="'admin'"
            @click="handleDelete(scope.$index, scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination-frame" background @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-sizes="[5, 10, 20, 30, 40]"
      :page-size="pageSize" :total="listTotal" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
  </div>
</template>
  
<script>
import { registerUser, updateUser, getUsers, deleteUser } from '@/api/user'
import store from '@/store'

export default {
  directives: {
    permission: {
      inserted: function (el, binding) {
        // 获取用户权限信息
        const username = store.getters.name
        const userPermission = username
        // 获取指令绑定的权限值
        const permission = binding.value
        // 如果用户没有该权限，则隐藏该元素
        if (userPermission !== permission) {
          el.setAttribute('disabled', 'true')
        }
      }
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      currentPage: 1,
      pageSize: 10,
      listTotal: 0,
      username: null,
      searchButtonExeStatus: false,
      newUsername: '',
      newPassword: '',
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    search() {
      this.currentPage = 1
      this.pageSize = 10
      this.searchButtonExeStatus = true
      this.fetchData()
    },

    fetchData() {
      var params
      if (this.searchButtonExeStatus) {
        params = {
          "columns": [
            {
              "exp": "=",
              "name": "username",
              "value": this.username,
              "logic": "&"
            },
          ],
          "page": this.currentPage - 1,
          "size": this.pageSize,
          "sort": "-created_at"
        };
      }

      if (this.searchButtonExeStatus === false) {
        params = {
          "columns": [
            {
              "exp": "!=",
              "name": "username",
              "value": "null"
            }
          ],
          "page": this.currentPage - 1,
          "size": this.pageSize,
          "sort": "created_at"
        };
      }

      this.listLoading = true
      getUsers(params).then(response => {
        this.list = response.data.users.map(obj => {
          return {
            ...obj,
          };
        });
        this.listTotal = response.data.total
        this.listLoading = false
      })
    },
    clearSearchData() {
      this.searchButtonExeStatus = false
      this.fetchData()
    },
    handleDelete(index, id) {
      this.$confirm('确定删除该条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户点击了确定按钮
        // 删除数据库的请求
        deleteUser(id).then(response => {
          if (response.code === 0) {
            this.list.splice(index, 1);
            this.$message.success('删除成功')
          } else {
            this.$message.error('删除失败')
          }
        })
      }).catch(() => {
        // 用户点击了取消按钮
      });
    },
    handleEdit(id, username) {
      const index = parseInt(id)
      this.$prompt('请输入新密码', '密码必须且只能包含字母和数字，不少于六位', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
        inputErrorMessage: '密码格式不正确'
      }).then(({ value }) => {
        updateUser({ id: index, username: username, password: value }).then(response => {
          if (response.code === 0) {
            this.$message({
              type: 'success',
              message: '密码已更改为: ' + value
            });
          } else {
            this.$message.error('密码更改失败')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消更改'
        });
      });
    },
    register() {

      if (this.newUsername == '' || this.newPassword == '') {
        this.$message.error('用户名或密码不得为空！')
        return
      }
      this.newUsername = this.newUsername.trim()
      this.newPassword = this.newPassword.trim()
      const regexName = /^[a-zA-Z][a-zA-Z0-9_]{6,}$/
      const regexPwd =  /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
      if (!regexName.test(this.newUsername)) {
        this.$message.error('用户名必须以字母开头，只允许包含字母、数字和下划线，不少于六位')
        this.newUsername = ''
        return
      }
      if (!regexPwd.test(this.newPassword)) {
        this.$message.error('密码必须且只能包含字母和数字，不少于六位')
        this.newPassword = ''
        return
      }

      registerUser({ username: this.newUsername, password: this.newPassword }).then(response => {
        if (response.code === 0) {
          this.$message.success('注册成功')
          this.newUsername = ''
          this.newPassword = ''
          this.fetchData()
        } else {
          console.log('失败')
          this.$message.error('注册失败')
        }
      }).catch(error => {
        console.log('Error' + error)
      })
    },
    // 分页事件
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchData()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.fetchData()
    }

  }
}
</script>
  
<style lang="scss">
.search-container,
.register-container {
  display: flex;
  padding: 5px;
  justify-content: space-between;
  align-items: center;
}

.el-input {
  flex: 1;
  margin: 0 10px;
}

.el-date-picker-datetimerange {
  flex: 3;
  margin: 0 10px;
}

.el-button-search,
.el-button-clear {
  flex: 1;
  margin: 0 10px;
}

.el-table-frame {
  width: 100vw;
  height: 70vh;
}

.el-table__body-wrapper {
  max-height: calc(100vh - 240px); // 设置最大高度为浏览器可见内容的高度减去一定的空间，如表头和分页栏的高度
  overflow-y: auto; // 设置垂直方向上出现滚动条
}

.pagination-frame {
  position: absolute; // 确定分页器的 position 属性
  left: 50%; // 将分页器居中
  transform: translateX(-50%); // 调整分页器的水平位置
}

.el-table__body {
  width: 100%; // 设置宽度为100%
}

.el-table__body::-webkit-scrollbar {
  width: 8px; // 设置滚动条宽度
  height: 8px; // 设置滚动条高度
}

.el-table__body::-webkit-scrollbar-thumb {
  background-color: #ccc; // 设置滚动条颜色
  border-radius: 5px; //* 设置滚动条圆角
}

.el-table__body::-webkit-scrollbar-track {
  background-color: #f0f0f0; // 设置滚动条背景颜色
  border-radius: 5px; // 设置滚动条圆角
}

.el-table__body::-webkit-scrollbar-thumb:hover {
  background-color: #aaa; // 设置滚动条悬浮时的颜色
}

// 当delete-button的disabled属性为"true"时，改变按钮的颜色和鼠标悬浮指针
.delete-button[disabled] {
  opacity: 0.5;
}

.delete-button[disabled]:hover {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>