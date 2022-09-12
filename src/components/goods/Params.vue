<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="注意:只允许为第三级分类设置相关参数!"
        type="warning"
        center
        show-icon
      >
      </el-alert>

      <!-- 选中商品区域 -->
      <el-row class="cate_option">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialog"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">

              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index,scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加新标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >

              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialog"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">

              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index,scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加新标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >

              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + getTitle"
      :visible.sync="AddDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加参数表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="getTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'编辑' + getTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 修改参数表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="getTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      //级联选择框配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      //级联选择框双向绑定到的数组
      selectKeys: [],

      //页签默认绑定的名称
      activeName: "many",
      //动态参数列表
      manyTableData: [],
      //静态参数列表
      onlyTableData: [],
      //控制添加参数的显示和隐藏
      AddDialogVisible: false,
      //添加参数表单
      addForm: {
        attr_name: "",
      },
      //添加参数表单验证
      addFormRules: {
        attr_name: [{ required: true, message: "请输入参数", trigger: "blur" }],
      },
      //控制编辑对话框的显示和隐藏
      editDialogVisible: false,
      //修改参数表单
      editForm: {},
      //修改参数表单的验证
      editFormRules: {
        attr_name: [{ required: true, message: "请输入参数", trigger: "blur" }],
      },

    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    //如果按钮需要被禁用返回true，否则返回false
    isBtnDisabled() {
      if (this.selectKeys.length !== 3) {
        return true;
      }
      return false;
    },

    //选中当前三级分类的id
    cateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2];
      }
      return null;
    },

    //显示添加动态参数或者静态属性的标题
    getTitle() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
  methods: {
    //获取所有商品列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
      this.cateList = res.data;
      //console.log(this.cateList);
    },

    //级联选择框选中项变化，触发函数
    handleChange() {
      this.getParamsDate();
    },

    //点击页签时的处理函数
    handleTabClick() {
      this.getParamsDate();
      //console.log(this.activeName);
    },

    //获取参数的列表数据
    async getParamsDate() {
      //选中的不是三级
      if (this.selectKeys.length !== 3) {
        this.selectKeys = [];
        this.manyTableData = []
        this.onlyTableData = []
        return;
      }
      //console.log(this.selectKeys);
      //根据所选分类的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //添加标签文本框的显示隐藏
        item.inputVisible = false
        //文本框绑定的值
        item.inputValue=''
      });
      //console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    //点击显示添加参数的对话框
    addDialog() {
      this.AddDialogVisible = true;
    },

    //对话框关闭重置信息
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },

    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败");
        }
        this.$message.success("添加参数成功");
        this.AddDialogVisible = false;
        this.getParamsDate();
      });
    },

    //监听编辑对话框关闭并清除信息
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },

    //点击编辑显示对话框
    async showEditDialog(attrid) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/` + attrid,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },

    //编辑参数信息
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        //console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        this.$message.success("修改参数成功");
        this.editDialogVisible = false;
        this.getParamsDate();
      });
    },

    //删除参数
    async removeParams(attrid) {
      const result = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((error) => error);
      if (result !== "confirm") {
        return this.$message.info("已取消删除参数");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/` + attrid
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败");
      }
      this.$message.success("删除参数成功");
      this.getParamsDate();
    },

    //对attr_vals进行操作并保存到数据库
    async setTag(row){
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name : row.attr_name,
        attr_sel : row.attr_sel,
        attr_vals : row.attr_vals.join(' ')
      })
      if(res.meta.status !== 200){
        return this.$message.error('提交参数项失败')
      }
      this.$message.success('提交参数项成功')
    },

    //监听文本框失去焦点或者按下enter键的事件
    handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有return，证明输入了内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //发起请求保存
      this.setTag(row)
    },

    //点击展示文本框
    showInput(row){
      row.inputVisible = true
      //文本框自动获得焦点
      //$nextTick方法的作用：就是当页面上元素被重新渲染后，才会指定回调函数中的代码
       this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },

    //删除标签
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.setTag(row)
    }
  },
};
</script>

<style lang="scss" scoped>
.cate_option {
  margin-top: 20px;
  margin-bottom: 20px;
}
.el-tag {
  margin: 15px;
}
.input-new-tag{
  width: 150px;
}
</style>