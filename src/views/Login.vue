<script>
// import { User, View } from '@element-plus/icons'
import storage from "./../utils/storage";
import util from "./../utils/utils";

export default {
  name: "home",
  data() {
    return {
      user: {
        userName: '',
        userPwd: ''
      },
      rules: {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        userPwd: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }

    }
  },

  methods: {
    goHome() {
      this.$router.push("/welcome")
    },
    login() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.$api.login(this.user).then(async (res) => {
            console.log(res)

            this.$store.commit('saveUserInfo', res)
            await this.loadAsyncRoutes();
            this.$router.push('/welcome')
          })
        } else {
          return false
        }
      });

  },
  async loadAsyncRoutes() {
    let userInfo = storage.getItem("userInfo") || {};
    if (userInfo.token) {
      try {
        const { menuList } = await this.$api.permissionList();
        let routes = util.generateRoute(menuList);
        routes.map((route) => {
          let url = `./../views/${route.component}.vue`;
          route.component = () => import(url);
          this.$router.addRoute("home", route);
        });
      } catch (error) {}
    }
  }
},
  // computed: {
  //   userS() {
  //     return User
  //   },
  //   view() {
  //     return View
  //   }
  // },
  mounted() {
    this.$storage.setItem("user", { name: "张三", age: 18 })
    // this.$request({
    //   method: 'get',
    //   url:'/login',
    //   data: {
    //     name: 'jason'
    //   },
    // }).then((res) => {
    //   console.log(res)
    // })
    // this.$request.get('/login',{name:'jason'},{
    //   mock:true,
    // }).then((res) => {
    //   console.log(res)
    // })
  }

}

</script>

<template>
  <div class="login-wrapper">
    <div class="modal">
      <el-form ref="userForm" :model="user" :rules="rules">
        <div class="title">登录页</div>
        <el-form-item prop="userName">
          <el-input type="text" prefix-icon="el-icon-user" v-model="user.userName"></el-input>
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input type="password" prefix-icon="el-icon-view" v-model="user.userPwd"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-login" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<style lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9fcff;
  width: 100vw;
  height: 100vh;

  .modal {
    width: 500px;
    padding: 35px;
    background: #fff;
    box-shadow: 0px 0px 10px 3px #c7c9cb4d;

    .title {
      font-size: 35px;
      line-height: 1.5;
      text-align: center;
    }

    .btn-login {
      width: 100%
    }
  }
}
</style>
