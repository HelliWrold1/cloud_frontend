<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar + '?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item class="el-dropdown-username">
              {{this.$store.getters.name}}
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="changePwd">修改密码</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog title="修改密码" :visible.sync="dialogFormVisible" :custom-class="'dialog-class'">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPasswordForm">重置</el-button>
        <el-button class="el-change" :disabled="submitDisabled" type="primary" @click="submitPasswordForm">修改</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { validUsername } from '@/utils/validate'
import { changeUser } from '@/api/user'
import store from '@/store'

export default {
  data() {
    return {
      dialogFormVisible: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      submitDisabled: true,
      passwordRules: {
        oldPassword: [
          { required: true, message: '旧密码不得为空', trigger: 'blur' },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value == '' || value.length == 0) {
                this.submitDisabled = true
                callback(new Error('旧密码不得为空'));
              } else {
                const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
                const newPassword = this.passwordForm.newPassword
                const confirmPassword = this.passwordForm.confirmPassword
                if (passwordReg.test(newPassword) && newPassword === confirmPassword) {
                  this.submitDisabled = false
                }
              }
            },
            trigger: ['blur','change'],
          },
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              // 使用正则表达式来检验密码格式
              const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
              if (!passwordReg.test(value)) {
                callback(new Error('密码必须且只能包含字母和数字，不少于六位'));
              } else {
                callback();
              }
            },
            trigger: ['blur','change'],
          },
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              // 获取新密码输入框中的值
              const oldPassword = this.passwordForm.oldPassword
              const newPassword = this.passwordForm.newPassword
              if (value !== newPassword) {
                this.submitDisabled = true
                callback(new Error('两次输入的密码不一致'));
              }
              if (value === newPassword && oldPassword.length !== 0) {
                this.submitDisabled = false
                callback();
              }
            },
            trigger: ['blur','change'],
          },
        ],
      },
    };
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async changePwd() {
      this.dialogFormVisible = true
    },
    resetPasswordForm() {
      this.$refs.passwordForm.resetFields();
    },
    submitPasswordForm() {
      changeUser({
        username: this.$store.getters.name,
        old_password: this.passwordForm.oldPassword,
        new_password: this.passwordForm.newPassword
      }).then(response => {
        if (response.code === 0) {
          this.$message.success('密码修改成功')
        } else {
          this.$message.error('密码修改失败')
        }
      })
      this.dialogFormVisible = false;
    },
  }
}
</script>

<style lang="scss" scoped>
.el-dropdown-username{
  font-weight: bold;
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.dialog-class {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.el-dialog__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.el-dialog {
  transform: translate(0, -50%);
}

.el-change[disabled] {
  opacity: 0.5;
}

.el-change[disabled]:hover {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
