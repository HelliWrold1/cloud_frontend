<template>
    <div>
        <div class="pub-interval-time-container">
            <el-time-picker v-model="time" :picker-options="{
                    selectableRange: '00:00:00 - 23:59:59'
                }" placeholder="任意时间点" editable clearable>
            </el-time-picker>

            <el-switch v-model="type" active-text="ClassC" inactive-text="ClassA">
            </el-switch>

            <el-input class="el-input-source" type="text" placeholder="输入目标DevAddr" v-model="target" clearable maxlength="8"
                show-word-limit>
            </el-input>
            <el-button class="el-button-publish" @click="publishDownlink"  v-permission="'admin'"  type="success">
                发布
            </el-button>
        </div>
    </div>
</template>

<script>

import { publishToMqtt } from '@/api/rule'
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
            time: new Date(0),
            target: '',
            data: '',
            type: false,
        }
    },
    methods: {

        converseTimeToData() {
            this.data = '1E'
            const hour = this.time.getHours().toString(16).padStart(2, '0')
            const min = this.time.getMinutes().toString(16).padStart(2, '0')
            const sec = this.time.getSeconds().toString(16).padStart(2, '0')
            this.data = this.data + hour + min + sec
        },

        publishDownlink() {

            this.converseTimeToData()

            const regex = /^[0-9a-fA-F]{8}$/;
            if (regex.test(this.target)) {
                var downlink
                if (this.type) { // ClassA
                    downlink = { "data": this.data, "port": 2, "time": "immediately", "devaddr": this.target, "confirmed": true }
                } else {
                    downlink = { "devaddr": this.target, "data": this.data, "confirmed": true }
                }
                var params = {
                    "payload": JSON.stringify(downlink),
                    "qos": 1,
                    "retain": false,
                    "topic": "downlinkToNode"
                }
                publishToMqtt(params).then(response => {
                    if (response.code === 0) {
                        this.$message.success('下行链路已发布')
                    } else {
                        this.$message.error('下行链路发布失败')
                    }
                })
            } else {
                this.$message.error('DevAddr格式错误');
            }
        }
    }

}
</script>

<style lang="scss">
.pub-interval-time-container {
    height: 80vh;
    width: 90vw;
    display: flex;
    align-items: center;
    justify-content: center;
}

.el-time-picker {
    width: 30vw;
    padding: 1vw;
}

.el-switch {
    padding: 1vw;
}

.el-input {
    width: 20vw;
}

.el-button-publish[disabled] {
    opacity: 0.5;
}

.el-button-publish[disabled]:hover {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>