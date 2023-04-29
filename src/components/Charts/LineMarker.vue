<template>
  <div>
    <div class="search-container" width="auto">
      <el-input class="el-input-devaddr" v-model="searchDevAddr" placeholder="输入DevAddr" clearable></el-input>
      <el-input class="el-input-gwmac" v-model="searchGwMac" placeholder="输入GWMAC" clearable></el-input>
      <el-button class="el-button-live" @click="getLiveData" type="primary">实时</el-button>
      <el-button class="el-button-history" @click="getHistoryData" plain>历史</el-button>
      <el-button class="el-button-data-control" @click="switchDataStorage" :type="controlType" v-permission="'admin'">{{ controlName
      }}</el-button>
    </div>
    <div class="chart-container">
      <div :id="id" :class="className" :style="{ height: height, width: width }" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import resize from './mixins/resize'
import { getFrames, subscribeMQTT, unsubscribeMQTT } from '@/api/charts'
import store from '@/store'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
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
      controlType: 'danger',
      controlName: '断开数据连接',
      searchDevAddr: '3EB4A376',
      searchGwMac: 'B827EBFFFE2114B5',
      timerId: null,
      frames: null,
      live: true,
      total: 999,
      chart: null,
      option: {
        title: {
          top: 20,
          text: 'GWMAC' + '.' + 'DevAddr',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#000000'
          },
          left: '1%'
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'cross',
            lineStyle: { color: 'red' },
          }
        },
        legend: {
          top: 20,
          // icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          data: ['co', 'co2', 'h2s', 'lux', 'nh3', 'humi', 'temp'],
          right: '4%',
          textStyle: {
            fontSize: 12,
            color: '#000000'
          },
        },
        grid: {
          top: 100,
          left: '2%',
          right: '2%',
          bottom: '11%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          max: "dataMax",
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          data: []
        },
        yAxis: {
          type: 'value',
          max: "dataMax",
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
            },
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          },
          splitLine: {
            lineStyle: {
              color: '#D3D3D3'
            }
          },
        },
        series: [
          {
            name: 'co',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
            // label: {
            //   show: true,
            //   position: 'top',
            //   formatter: '{c}ppm'
            // },
          },
          {
            name: 'co2',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
          },
          {
            name: 'h2s',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
          },
          {
            name: 'lux',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
          },
          {
            name: 'nh3',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
          },
          {
            name: 'humi',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
          },
          {
            name: 'temp',
            type: 'line',
            data: [],
            smooth: true,
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
          },
        ],
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty',
            throttle: 100, // 控制缩放过程中的事件触发频率
            debounce: 100 // 控制结束缩放后的事件触发频率
          },
          {
            type: 'inside',
            yAxisIndex: 0,
            filterMode: 'empty',
            throttle: 100, // 控制缩放过程中的事件触发频率
            debounce: 100 // 控制结束缩放后的事件触发频率
          },
        ],
      },
    }
  },
  created() {
  },
  mounted() {
    this.initChart()
    this.getLiveData()
  },
  beforeDestroy() {
    console.log('销毁')
    if (!this.chart) {
      return
    }
    clearInterval(this.timerId) // 销毁定时器
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.option)
    },
    switchDataStorage() {
      if (this.controlType === 'danger') {
        unsubscribeMQTT({ topic: 'uplinkToCloud', qos: 1 }).then(response => {
          if (response.code === 0) {
            this.controlType = 'primary'
            this.controlName = '打开数据连接'
            this.$message.success('已断开数据连接')
          }
        })
      } else {
        subscribeMQTT({ topic: 'uplinkToCloud', qos: 1 }).then(response => {
          if (response.code === 0) {
            this.controlType = 'danger'
            this.controlName = '断开数据连接'
            this.$message.success('已打开数据连接')
          }
        })
      }
    },

    getLiveData() {
      this.live = true
      for (let index = 0; index < this.option.series.length; index++) {
        this.option.series[index].data = []
      }
      this.chart.setOption(this.option)
      //开启定时器
      var preDateTime = new Date()
      this.timerId = setInterval(() => {
        var nowDateTime = 0
        var params = {
          "columns": [
            {
              "exp": "=",
              "name": "data_type",
              "value": "0",
              "logic": "&"
            },
            {
              "exp": "=",
              "name": "dev_addr",
              "value": this.searchDevAddr.trim(),
              "logic": "&"
            },
            {
              "exp": "=",
              "name": "gateway_mac",
              "value": this.searchGwMac.trim(),
              "logic": "&"
            },
          ],
          "page": 0,
          "size": 1,
          "sort": "-created_at"
        };
        getFrames(params).then(response => {
          this.frames = response.data.frames.map(obj => {
            return {
              ...obj,
              frame: JSON.parse(obj.frame)
            };
          });
          this.total = response.data.total
        }).catch(error => {
          console.log('Error ' + error);
        });
        const index = 0
        if (this.frames != null) {
          this.option.title.text = this.searchGwMac.trim() + '.' + this.searchDevAddr.trim()
          nowDateTime = new Date(this.frames[index].frame.localtime)
        }
        if (preDateTime < nowDateTime) {
          preDateTime = nowDateTime
          this.option.xAxis.data.push(nowDateTime.toLocaleDateString() + ' ' + nowDateTime.toLocaleTimeString())
          this.option.series[0].data.push(this.frames[index].frame.co)
          this.option.series[1].data.push(this.frames[index].frame.co2)
          this.option.series[2].data.push(this.frames[index].frame.h2s)
          this.option.series[3].data.push(this.frames[index].frame.lux)
          this.option.series[4].data.push(this.frames[index].frame.nh3)
          this.option.series[5].data.push(this.frames[index].frame.humi)
          this.option.series[6].data.push(this.frames[index].frame.temp)
          try {
            this.chart.setOption(this.option)
          } catch (error) {
          }
        }
      }, 1000);
    },
    getHistoryData() {
      this.live = false
      clearInterval(this.timerId)
      for (let index = 0; index < this.option.series.length; index++) {
        this.option.series[index].data = []
      }
      this.chart.setOption(this.option)
      var params = {
        "columns": [
          {
            "exp": "=",
            "name": "data_type",
            "value": "0",
            "logic": "&"
          },
          {
            "exp": "=",
            "name": "dev_addr",
            "value": this.searchDevAddr.trim(),
            "logic": "&"
          },
          {
            "exp": "=",
            "name": "gateway_mac",
            "value": this.searchGwMac.trim(),
            "logic": "&"
          },
        ],
        "page": 0,
        "size": this.total,
        "sort": "created_at"
      };
      getFrames(params).then(response => {
        this.frames = response.data.frames.map(obj => {
          return {
            ...obj,
            frame: JSON.parse(obj.frame)
          };
        });
        var self = this
        if (self.frames != null) {
          (function () {
            async function feedData() {
              self.option.title.text = self.searchGwMac + '.' + self.searchDevAddr
              for (let index = 0; index < self.frames.length; index++) {
                if (self.live) {
                  break
                }
                const dateTime = new Date(self.frames[index].frame.localtime);
                self.option.xAxis.data.push(dateTime.toLocaleDateString() + ' ' + dateTime.toLocaleTimeString())
                self.option.series[0].data.push(self.frames[index].frame.co)
                self.option.series[1].data.push(self.frames[index].frame.co2)
                self.option.series[2].data.push(self.frames[index].frame.h2s)
                self.option.series[3].data.push(self.frames[index].frame.lux)
                self.option.series[4].data.push(self.frames[index].frame.nh3)
                self.option.series[5].data.push(self.frames[index].frame.humi)
                self.option.series[6].data.push(self.frames[index].frame.temp)
                try {
                  self.chart.setOption(self.option)
                } catch (error) {
                }
                await sleep(200); // 等待 1 秒钟
              }
            }
            function sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            feedData();
          })();

        }
      }).catch(error => {
        console.log('Error ' + error);
      });
    },
  }
}
</script>

<style>
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

.el-button-live,
.el-button-history,
.el-button-data-control {
  flex: 1;
  margin: 0 10px;
}

/* 当el-button-data-control的disabled属性为"true"时，改变按钮的颜色和鼠标悬浮指针 */
.el-button-data-control[disabled] {
  opacity: 0.5;
}

.el-button-data-control[disabled]:hover {
  opacity: 0.5;
  cursor: not-allowed;
}

.chart-container {
  position: relative;
  width: 95vw;
  height: 85vh;
}
</style>