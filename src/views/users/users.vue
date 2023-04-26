<template>
  <div class="app-container">
    <div class="search-container">
      <el-input class="el-input-username" v-model="username" placeholder="输入用户名" clearable></el-input>
      <el-button class="el-button-search" @click="search" type="primary">搜索</el-button>
      <el-button class="el-button-clear" @click="clearSearchData" plain>清除搜索结果</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" width="auto" element-loading-text="Loading" border sortable="true"
      @sort-change="handleSortChange" highlight-current-row class="el-table-frame" page-size="pageSize">
      <el-table-column label="Username" sortable="custom" prop="username" align="center" width="auto">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="Operation" align="center" width="auto">
        <el-button class="delete-button" type="danger" size="mini" v-permission="'admin'" slot-scope="scope"
          @click="handleDelete(scope.$index, scope.row.id)">
          删除
        </el-button>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination-frame" background @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-sizes="[5, 10, 20, 30, 40]"
      :page-size="pageSize" :total="listTotal" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
  </div>
</template>
  
<script>
import { registerUser, changeUser, getUsers, deleteUser } from '@/api/user'
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
    handleSortChange(sort) {
      // 根据sort对象中的属性更新数据源
      console.log(sort)
      const { prop, order } = sort

      // 对表格数据进行排序
      this.list.sort((a, b) => {
        // 根据ID属性排序
        var val1, val2
        if (prop.includes('.')) { // 处理深层键值
          const propArr = prop.split('.')
          val1 = a[propArr[0]][propArr[1]]
          val2 = b[propArr[0]][propArr[1]]
          if (prop == 'frame.localtime') { // 处理时间列
            val1 = new Date(val1).getTime()
            val2 = new Date(val2).getTime()
          }
        } else { // 处理浅层键值
          val1 = a[prop]
          val2 = b[prop]
        }

        return order === 'ascending' ? val1 - val2 : val2 - val1
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
.search-container {
  display: flex;
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
  height: 75vh;
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