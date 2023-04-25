<template>
  <div>
    <div class="rules-op-container">
      <el-button class="el-button-append" @click="appendRule" type="primary">追加规则</el-button>
      <el-button class="el-button-reset" @click="resetRules" type="danger">重建规则</el-button>
      <el-button class="el-button-publish" @click="publishRules" type="success">规则发布</el-button>
    </div>

    <div class="rule-editor-container">
      <div class="json-edit-container">
        <vue-json-editor :key="editorReloadKey" class="json-editor" v-model="rules" :showBtns="false" lang="zh"
          :mode="'code'" @json-change="onJsonChange" @json-save="onJsonSave" @has-error="onError">
        </vue-json-editor>
      </div>

      <div class="rule-op-container">
        <div class="rule-source-container">
          <el-input class="el-input-source" type="text" placeholder="输入数据源DevAddr" v-model="source" clearable
            maxlength="8" show-word-limit>
          </el-input>
          <el-button class="el-button-source" @click="confirmSource" type="primary">确认</el-button>
        </div>
        <div class="rule-targets-container">
          <el-input class="el-input-targets" placeholder="输入控制目标DevAddr" v-model="target" clearable maxlength="8"
            show-word-limit>
          </el-input>
          <el-button class="el-button-targets" @click="appendTarget" type="primary">追加</el-button>
        </div>

        <div class="rule-condition-container">
          <div class="condition-co">
            <span class="slider-text">CO({{ co[0] + ':' + co[1] }})</span>
            <el-slider v-model="co" range show-stops :min="10" :max="1000" show-input-controls>
            </el-slider>
          </div>
          <div class="condition-co2">
            <span class="slider-text">CO2({{ co2[0] + ':' + co2[1] }})</span>
            <el-slider v-model="co2" range show-stops :min="400" :max="60000" :step="4">
            </el-slider>
          </div>
          <div class="condition-h2s">
            <span class="slider-text">H2S({{ h2s[0] + ':' + h2s[1] }})</span>
            <el-slider v-model="h2s" range show-stops :min="1" :max="200">
            </el-slider>
          </div>
          <div class="condition-lux">
            <span class="slider-text">Light({{ lux[0] + ':' + lux[1] }})</span>
            <el-slider v-model="lux" range show-stops :min="0" :max="65535" :step="5">
            </el-slider>
          </div>
          <div class="condition-nh3">
            <span class="slider-text">NH3({{ nh3[0] + ':' + nh3[1] }})</span>
            <el-slider v-model="nh3" range show-stops :min="5" :max="500">
            </el-slider>
          </div>
          <div class="condition-humi">
            <span class="slider-text">HUMI({{ humi[0] + ':' + humi[1] }})</span>
            <el-slider v-model="humi" range show-stops :min="20" :max="90" :step="0.1">
            </el-slider>
          </div>
          <div class="condition-temp">
            <span class="slider-text">TEMP({{ temp[0] + ':' + temp[1] }})</span>
            <el-slider v-model="temp" range show-stops :min="0" :max="50" :step="0.1">
            </el-slider>
          </div>
          <div class="condition-append-container">
            <el-button class="el-button-append" @click="appendCondition" type="primary">追加条件组</el-button>
          </div>
        </div>

        <div class="rule-actions-container">
          <span class="switch-text">风扇</span>
          <el-switch v-model="fun" active-text="打开" inactive-text="关闭">
          </el-switch>
          <span class="switch-text">灯</span>
          <el-switch v-model="light" active-text="打开" inactive-text="关闭">
          </el-switch>
          <el-button class="el-button-source" @click="appendAction" type="primary">追加动作组</el-button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>

import { publishToMqtt, getDownlinks } from '@/api/rule'
import vueJsonEditor from 'vue-json-editor'
import { parseTime } from '@/utils'

export default {
  // 注册组件
  components: { vueJsonEditor },
  data() {
    return {
      rules: {},
      ruleNextKey: null,
      source: '',
      condition: {
        "co2min": 400,
        "co2max": 60000,
        "comin": 10,
        "comax": 1000,
        "h2smin": 1,
        "h2smax": 200,
        "nh3min": 5,
        "nh3max": 500,
        "tempmin": 0,
        "tempmax": 50,
        "humimin": 20,
        "humimax": 90,
        "luxmin": 0,
        "luxmax": 65535
      },
      target: '',
      action: {
        'light': '',
        'fun': '',
      },
      co: [10, 1000],
      co2: [400, 60000],
      h2s: [1, 200],
      lux: [0, 65535],
      nh3: [5, 500],
      humi: [20, 90],
      temp: [0, 50],
      light: false,
      fun: false,
      hasJsonFlag: true,  // json是否验证通过
      editorReloadKey: 0,
    }
  },
  mounted: function () {
    this.getRules()
    this.ruleNextKey = this.findMaxKey(this.rules)
  },
  methods: {
    onJsonChange(value) {
      // 实时保存
      this.onJsonSave(value)
    },
    onJsonSave(value) {
      this.$message.success('规则集保存成功')
      this.rules = value
      this.hasJsonFlag = true
    },
    onError(value) {
      this.$message.error('JSON格式错误')
      this.hasJsonFlag = false
    },

    // 找最大的键，返回下一个键
    findMaxKey(obj) {
      let maxKey = -Infinity;
      if (!obj.hasOwnProperty('0')) {
        return String(0)
      }
      for (let key in obj) {
        if (parseInt(key) > maxKey) {
          maxKey = parseInt(key);
        }
      }
      maxKey += 1
      return String(maxKey)
    },

    confirmSource() {
      const regex = /^[0-9a-fA-F]{8}$/;
      if (regex.test(this.source)) {
        if (!this.rules.hasOwnProperty(this.ruleNextKey)) {
          this.rules[this.ruleNextKey] = { 'source': this.source }
        }
        this.reloadRules()
        this.$message.success('已设置数据源')
        return
      }
      this.$message.error('DevAddr格式错误');
      this.source = ''
    },

    appendTarget() {
      const regex = /^[0-9a-fA-F]{8}$/;
      if (regex.test(this.target)) {
        if (!this.rules[this.ruleNextKey].hasOwnProperty('targets')) {
          Object.assign(this.rules[this.ruleNextKey], { 'targets': [] })
        }
        this.rules[this.ruleNextKey].targets.push(this.target)
        this.reloadRules()
        this.$message.success('已追加目标')
        return
      }
      this.$message.error('DevAddr格式错误');
      this.target = ''
    },

    appendCondition() {
      if (!this.rules[this.ruleNextKey].hasOwnProperty('conditions')) {
        Object.assign(this.rules[this.ruleNextKey], { 'conditions': {} })
      }
      this.condition.comin = this.co[0]
      this.condition.comax = this.co[1]
      this.condition.co2min = this.co2[0]
      this.condition.co2max = this.co2[1]
      this.condition.h2smin = this.h2s[0]
      this.condition.h2smax = this.h2s[1]
      this.condition.luxmin = this.lux[0]
      this.condition.luxmax = this.lux[1]
      this.condition.nh3min = this.nh3[0]
      this.condition.nh3max = this.nh3[1]
      this.condition.humimin = this.humi[0]
      this.condition.humimax = this.humi[1]
      this.condition.tempmin = this.temp[0]
      this.condition.tempmax = this.temp[1]
      var nextConditionKey = this.findMaxKey(this.rules[this.ruleNextKey].conditions)
      let cond = {}
      cond[nextConditionKey] = this.condition
      cond = JSON.parse(JSON.stringify(cond))
      Object.assign(this.rules[this.ruleNextKey].conditions, cond)
      this.reloadRules()
      this.$message.success('已追加条件组')
    },

    appendAction() {
      if (!this.rules[this.ruleNextKey].hasOwnProperty('actions')) {
        Object.assign(this.rules[this.ruleNextKey], { 'actions': {} })
      }
      if (typeof this.light === 'undefined' || typeof this.fun === 'undefined') {
        this.$message.error('动作组未初始化');
      }

      if (this.light) {
        this.action.light = 'open'
      } else {
        this.action.light = 'close'
      }
      if (this.fun) {
        this.action.fun = 'open'
      } else {
        this.action.fun = 'close'
      }
      var nextActKey = this.findMaxKey(this.rules[this.ruleNextKey].actions)
      let act = {}
      act[nextActKey] = this.action
      act = JSON.parse(JSON.stringify(act))
      this.rules[this.ruleNextKey].actions = { ...this.rules[this.ruleNextKey].actions, ...act }
      // Object.assign(this.rules[this.ruleNextKey].actions, act)
      this.reloadRules()
      this.$message.success('已追加动作组')
    },

    appendRule() {
      this.source = ''
      this.target = ''
      this.action = {
        'light': '',
        'fun': '',
      },
        this.ruleNextKey = this.findMaxKey(this.rules)
      this.reloadRules()
    },

    reloadRules() {
      this.editorReloadKey += 1
    },

    resetRules() {
      this.rules = {}
      this.source = ''
      this.target = ''
      this.action = {
        'light': '',
        'fun': '',
      }, ''
      this.ruleNextKey = 0
      this.reloadRules()
    },

    publishRules() {
      var params = {
        "payload": JSON.stringify(this.rules),
        "qos": 1,
        "retain": false,
        "topic": "rulesFromCloud"
      }
      publishToMqtt(params).then(response => {
        if (response.code === 0) {
          this.$message.success('规则集已发布')
          // this.getRules()
        } else {
          this.$message.error('规则集发布失败')
        }
      }).catch(error => {
        console.log('Error' + error)
      });
    },

    getRules() {
      var params = {
        "columns": [
          {
            "exp": "=",
            "logic": "&",
            "name": "dev_addr",
            "value": ""
          }
        ],
        "page": 0,
        "size": 1,
        "sort": "-created_at"
      }
      getDownlinks(params).then(response => {
        this.rules = JSON.parse(response.data.downlinks[0].down_link)
      })
    }
  }
}
</script>

<style lang="scss">
.rules-op-container {
  display: flex;
  // justify-content: space-between;
  align-items: center;
  height: 10vh;
  width: auto;
}

.rule-editor-container {
  display: flex;
  height: 80vh;
  width: 100vw;
}

.json-edit-container {
  height: 80vh;
  width: 30vw;
}

.json-editor {
  height: 100%;
  width: 100%;
}

.jsoneditor-vue {
  height: 80vh;
}

.jsoneditor-poweredBy {
  display: none;
}

.rule-op-container {
  padding: 20px;
  height: 80vh;
  width: 70vw;
}

.rule-source-container,
.rule-targets-container {
  display: flex;
  justify-content: center;
  padding: 3px;
}

.el-input {
  width: 15vw;
}

.el-button-source,
.el-button-targets {}

.rule-condition-container {
  padding: 20px;
}

.condition-co,
.condition-co2,
.condition-h2s,
.condition-lux,
.condition-nh3,
.condition-humi,
.condition-temp {
  width: 60vw;
  padding: 1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-slider {
  width: 90%;
  margin-left: 15px;
  margin-right: 35px;
}

.slider-text {
  margin-left: 1vw;
  width: 15vw;
  display: inline-block;
  /* 设置为 inline-block 块级元素 */
  white-space: nowrap;
  /* 禁止换行 */
}

.condition-append-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule-actions-container {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-text {
  margin-right: 10px;
}

.el-switch {
  padding: 10px;
}
</style>