<template>
  <div>
    <div class="rule-op-container">
      <el-button class="el-button-append" @click="" type="primary">追加规则</el-button>
      <el-button class="el-button-reset" @click="" type="danger">重建规则</el-button>
      <el-button class="el-button-publish" @click="" type="success">规则发布</el-button>
    </div>

    <div class="json-edit-container"></div>
  </div>
</template>

<style lang="scss">
.rule-op-container {
  display: flex;
  // justify-content: space-between;
  align-items: center;
}

.json-edit-container {
  height: 95vh;
  width: 50vw;
}
</style>