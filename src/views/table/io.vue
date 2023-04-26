<template>
    <div class="app-container">
        <div class="search-container">
            <el-input class="el-input-devaddr" v-model="searchDevAddr" placeholder="输入DevAddr" clearable></el-input>
            <el-input class="el-input-gwmac" v-model="searchGwMac" placeholder="输入GWMAC" clearable></el-input>
            <el-date-picker class="el-date-picker-datetimerange" v-model="searchDateTimeRange" type="datetimerange"
                range-separator="至" start-placeholder="开始日期时间" end-placeholder="结束日期时间">
            </el-date-picker>
            <el-button class="el-button-search" @click="search" type="primary">搜索</el-button>
            <el-button class="el-button-clear" @click="clearSearchData" plain>清除搜索结果</el-button>
        </div>
        <el-table v-loading="listLoading" :data="list" width="auto" element-loading-text="Loading" border sortable="true"
            @sort-change="handleSortChange" highlight-current-row class="el-table-frame" page-size="pageSize">
            <el-table-column label="ID" sortable="custom" prop="id" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column label="DevAddr" sortable="custom" prop="dev_addr" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.dev_addr }}
                </template>
            </el-table-column>
            <el-table-column label="GWMAC" sortable="custom" prop="gateway_mac" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.gateway_mac }}
                </template>
            </el-table-column>
            <el-table-column label="IO4" sortable="custom" prop="frame.io4" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io4 }}
                </template>
            </el-table-column>
            <el-table-column label="IO5" sortable="custom" prop="frame.io5" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io5 }}
                </template>
            </el-table-column>
            <el-table-column label="IO8" sortable="custom" prop="frame.io8" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io8 }}
                </template>
            </el-table-column>
            <el-table-column label="IO9" sortable="custom" prop="frame.io9" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io9 }}
                </template>
            </el-table-column>
            <el-table-column label="IO11" sortable="custom" prop="frame.io11" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io11 }}
                </template>
            </el-table-column>
            <el-table-column label="IO14" sortable="custom" prop="frame.io14" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io14 }}
                </template>
            </el-table-column>
            <el-table-column label="IO15" sortable="custom" prop="frame.io15" align="center" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.frame.io15 }}
                </template>
            </el-table-column>

            <el-table-column label="localtime" sortable="custom" prop="frame.localtime" align="center" width="auto">
                <template slot-scope="scope">
                    <i class="el-icon-time" />
                    {{ scope.row.frame.localtime }}
                </template>
            </el-table-column>
            <el-table-column label="Operation" align="center" width="auto">
                <el-button class="delete-botton" type="danger" size="mini" v-permission="'admin'" slot-scope="scope"
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
import { getList, getFrames } from '@/api/table'
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
            searchDevAddr: null,
            searchGwMac: null,
            searchDateTimeRange: [],
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
                var GteTime = this.searchDateTimeRange[0].toLocaleDateString() + ' ' + this.searchDateTimeRange[0].toLocaleTimeString()
                var LteTime = this.searchDateTimeRange[1].toLocaleDateString() + ' ' + this.searchDateTimeRange[1].toLocaleTimeString()
                GteTime = GteTime.trim()
                LteTime = LteTime.trim()
                params = {
                    "columns": [
                        {
                            "exp": "=",
                            "name": "data_type",
                            "value": "1",
                            "logic": "&"
                        },
                        {
                            "exp": "=",
                            "name": "dev_addr",
                            "value": this.searchDevAddr,
                            "logic": "&"
                        },
                        {
                            "exp": "=",
                            "name": "gateway_mac",
                            "value": this.searchGwMac,
                            "logic": "&"
                        },
                        {
                            "exp": ">=",
                            "name": "created_at",
                            "value": GteTime,
                            "logic": "&"
                        },
                        {
                            "exp": "<=",
                            "name": "created_at",
                            "value": LteTime,
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
                            "exp": "=",
                            "name": "data_type",
                            "value": "1"
                        }
                    ],
                    "page": this.currentPage - 1,
                    "size": this.pageSize,
                    "sort": "-created_at"
                };
            }

            this.listLoading = true
            getFrames(params).then(response => {
                this.list = response.data.frames.map(obj => {
                    return {
                        ...obj,
                        frame: JSON.parse(obj.frame)
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
                this.list.splice(index, 1);
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

.el-input-devaddr,
.el-input-gwmac {
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

// 当delete-botton的disabled属性为"true"时，改变按钮的颜色和鼠标悬浮指针
.delete-botton[disabled] {
    color: #FFF;
    background-color: #fab6b6;
    border-color: #fab6b6;
}

.delete-botton[disabled]:hover {
    cursor: not-allowed;
}
</style>