<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <img src='../assets/img/head.jpg'/>
                <h2>LOGIN</h2>
            </div>
            <el-form ref="loginFormRef" class="loginForm" :model="loginForm" :rules="loginFormRules">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-yonghuming" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-mima" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            //登录表单的数据绑定对象
            loginForm:{
                username:'admin',
                password:'123456',
            },
            //表单的验证规则
            loginFormRules:{
                //验证用户名是否合法
                username:[
                    {required:true,message:'请输入用户名',trigger:'blur'},
                    {min:3,max:10,message:'长度在3-10之间',trigger:'blur'}
                ],
                //验证密码是否合法
                password:[
                    {required:true,message:'请输入密码',trigger:'blur'},
                    {min:6,max:12,message:'长度在6-12之间',trigger:'blur'}
                ]
            }
        }
    },
    methods:{
        reset(){
            //console.log(this);
            this.$refs.loginFormRef.resetFields();
        },
        //表单预验证
        login(){
            this.$refs.loginFormRef.validate(async valid => {
                if(!valid) return;
                const { data:res } = await this.$http.post("login",this.loginForm);
                //console.log(res);
                if(res.meta.status !== 200) return this.$message.error('登录失败');
                this.$message.success("登录成功");
                window.sessionStorage.setItem('token',res.data.token);
                this.$router.push('/home');
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.login_container{
    height: 100%;
    background: url('../assets/img/bg.jpg') no-repeat;
    background-size: 100% 100%; 
    
    display: flex;
    align-items: center;
    justify-content: center;
}
.login_box{
        width:500px;
        height: 350px;
        border-radius: 5px;
        background: #fff;
         border:1px solid #999;
        box-shadow:0px 0px 10px #000;
        opacity: 0.7;
        position: relative;
        text-align: center;
        .avatar_box{
            width: 100px;
            height: 100px;
            position: absolute;
            left: calc(50% - 50px);
            top:-12%;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                box-shadow:0px 0px 10px #999;
            }
            h2{
                background-image: linear-gradient(to bottom right, blue , purple);
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent
            }
        }
    }
.loginForm{
    position: absolute;
    bottom: 8%;
    width: 100%;
    padding: 0 100px;
    box-sizing: border-box;
}

</style>