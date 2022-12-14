<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert
        title="添加商品信息"
        :closable="false"
        type="info"
        center
        show-icon
      >
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="cb"
                  v-for="(cb, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览对话框 -->
      <el-dialog
        title="图片预览"
        :visible.sync="imgDialogVisible"
        width="50%"
      >
        <img :src="previewPath" class="preview"/>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: "0",
      //表单的数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //商品图片
        pics: [],
        //商品详情介绍
        goods_introduce:'',
        attrs:[],
      },
      //表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选中商品分类", trigger: "blur" },
        ],
      },
      //分类列表
      cateList: [],
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        expandTrigger: "hover",
      },
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      //上传图片的地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //预览图片的路径
      previewPath: "",
      //预览图片对话框的显示隐藏
      imgDialogVisible:false,

    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表失败");
      }
      this.cateList = res.data;
      //console.log(this.cateList);
    },

    //级联选择器变化，触发的函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },

    //tab切换处理的函数
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },

    //点击切换tab1\2
    async tabClick() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品动态参数失败");
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品静态失败");
        }
        //console.log(res.data);
        this.onlyTableData = res.data;
      }
    },

    //处理图片预览效果
    handlePreview(file) {
      //console.log(file);
      this.previewPath = file.response.data.url;
      this.imgDialogVisible = true
      //console.log(this.previewPath);
    },

    //处理图片删除效果
    handleRemove(file) {
      //console.log(file);
      //获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      //从pics数组中找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm.pics);
    },

    //上传成功后的处理函数
    handleSuccess(response) {
      //拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path,
      };
      this.addForm.pics.push(picInfo);
      //console.log(this.addForm.pics);
    },

    //添加商品
    add(){
        this.$refs.addFormRef.validate(async valid => {
            if(!valid){
                return this.$message.error('请填写必要的表单项')
            }
            //使用lodash深拷贝addForm
            const form = _.cloneDeep(this.addForm)
            form.goods_cat = form.goods_cat.join(',')
            //处理动态参数
            this.manyTableData.forEach(item => {
                const newInfo = {
                    attr_id : item.attr_id,
                    attr_value : item.attr_vals.join(' ')
                }
                this.addForm.attrs.push(newInfo)
            })
            //处理静态属性
            this.onlyTableData.forEach(item => {
                const newInfo = {
                    attr_id : item.attr_id,
                    attr_value : item.attr_vals
                }
                this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs
            //console.log(form);
            const {data:res} = await this.$http.post('goods',form)
            if(res.meta.status !== 201){
                return this.$message.error('添加商品失败')
            }
            this.$message.success('添加商品成功')
            this.$router.push({path:'/goods'})
        })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.el-steps {
  margin: 20px 0 20px 220px;
}
.el-checkbox {
  margin-left: 20px;
}
.preview{
    width:100%
}
.btn{
    margin-top: 15px;
}
</style>