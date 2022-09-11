<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCate">添加分类</el-button>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        stripe
        style="font-size: 15px"
        align="center"
        border
        class="marginTop"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showEditCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCatedialogVisible"
        width="50%"
        @close="addCateClose"
      >
        <!-- 表单 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <el-cascader
              v-model="selectKeys"
              :options="fatherList"
              :props="cateProps"
              @change="CatehandleChange"
              placeholder="请选择"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCatedialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCatedialogVisible"
        width="50%"
        @close="editCateClose"
      >
        <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCatedialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品列表
      cateList: [],
      //请求的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //数据条数
      total: 0,
      //表格列的内容
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //当前列定义为模板列
          type: "template",
          //当前这一列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          //当前列定义为模板列
          type: "template",
          //当前这一列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          //当前列定义为模板列
          type: "template",
          //当前这一列使用的模板名称
          template: "opt",
        },
      ],

      //添加分类对话框显示隐藏
      addCatedialogVisible: false,

      //商品分类
      addCateForm: {
        //父级分类的id
        cat_pid: 0,
        //分类名称
        cat_name: "",
        //分类等级
        cat_level: 0,
      },

      //商品分类表单验证
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },

      //父级列表
      fatherList: [],

      //级联选择器的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },

      //选中父级分类的id数组
      selectKeys: [],

      //编辑分类对话框显示隐藏
      editCatedialogVisible: false,

      //编辑分类列表
      editCateForm:{},

      //编辑分类表单验证
      editCateFormRules:{
        cat_name:[
          { required:true,message:'请输入分类名称',trigger:'blur' }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类的数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      //console.log(res.data);
      //数据列表赋值cateList
      this.cateList = res.data.result;
      //为总的数据条数赋值
      this.total = res.data.total;
    },

    //监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },

    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },

    //获取父级列表，打开添加分类对话框
    showAddCate() {
      this.getFatherList();
      this.addCatedialogVisible = true;
    },

    //获取父级列表
    async getFatherList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级列表失败");
      }
      this.fatherList = res.data;
      //console.log(this.fatherList);
    },

    //选择项发生变化触发
    CatehandleChange() {
      console.log(this.selectKeys);
      //如果selectKeys数组中的长度大于0，证明选中了父级分类
      //反正就是没选中
      if (this.selectKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    //点击提交添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCatedialogVisible = false;
      });
    },

    //监听对话框的关闭事件，重置表单数据
    addCateClose() {
      this.$refs.addCateFormRef.resetFields();
      this.selectKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },

    //显示编辑分类对话框
    async showEditCate(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类名称失败");
      }
      this.editCateForm = res.data
      //console.log(this.editCateForm);
      this.editCatedialogVisible = true;
    },

    //提交分类编辑
    editCate(){
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name})
        //console.log(res);
        if(res.meta.status !== 200){
          return this.$message.error('修改分类失败')
        }
        this.editCatedialogVisible = false
        this.getCateList()
        this.$message.success('修改分类成功')
      })
    },

    //监听分类编辑关闭清除验证
    editCateClose(){
      this.$refs.editCateFormRef.resetFields()
    },

    //删除分类
    async removeCate(id){
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(error => error)
      //console.log(result);
      if(result !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} = await this.$http.delete('categories/'+id)
      if(res.meta.status !== 200){
        return this.$message.error('删除分类失败')
      }
      this.editCatedialogVisible = false
      this.getCateList()
      this.$message.success('删除分类成功')
    }
  },
};
</script>

<style lang="scss" scoped>
.marginTop {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>