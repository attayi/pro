<template>
    <div class="role-manage">
        <div class="query-form">
            <el-form
                :inline="true"
                :model="queryForm"
                ref="form">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="queryForm.roleName" placeholder="请输入角色名称"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getRoleList">查询</el-button>
                <el-button>重置</el-button>
            </el-form-item>
            </el-form>
        </div>
        <!--表格-->
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleAdd">创建</el-button>
            </div>
            <el-table
                :data="roleList"
                style="width: 100%"
                row-key="_id">
                <el-table-column
                    v-for="item in columns"
                    :key="item.prop"
                    :prop="item.prop"
                    :label="item.label"
                    :width="item.width"
                    :formatter="item.formatter"/>
                    <!--操作列-->
                <el-table-column label="操作" width="280">
                    <template #default="scope">
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <!--scope.row: 一行的数据-->
                        <el-button 
                          size="mini"
                          type="primaty"
                          @click="handlePermission(scope.row)">设置权限</el-button>
                          <el-button
                            type="danger"
                            size="mini"
                            @click="handelDelete(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>>
            </el-table>
            <!--分页-->
            <el-pagination
                background
                layout="prev, pager, next"
                :total="pager.total"
                class="pagination"
                :page-size="pager.pageSize"
                @current-change="handleCurrentChange"></el-pagination>
        </div>
        <!--模态框-->
        <el-dialog
          title="角色新增"
          v-model="showModal"
          :before-close="handleCloseDialog">
            <el-form
              :model="roleForm"
              label-width="120px"
              ref="dialogForm"
              :rules="rules">
                <el-form-item prop="roleName" label="角色名称">
                    <el-input placeholder="请输入角色名称" v-model="roleForm.roleName"/>
                </el-form-item>
                <el-form-item
                    prop="remark"
                    label="备注">
                    <el-input
                     type="textarea"
                     :row="2"
                     placeholder="请输入备注"
                     v-model="roleForm.remark"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">确定</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog
            title="设置权限"
            v-model="showPermission"
            :before-close="handlePermissionClose"
            >
                <el-form label-width="120px">
                    <el-form-item prop="roleName" label="角色名称">
                        {{ curRoleName }}
                    </el-form-item>
                    <el-form-item prop="remark" label="选择权限">
                        <!--树形控件-->
                        <el-tree
                            :data="menuList"
                            show-checkbox
                            node-key="_id"
                            :props="{ label: 'menuName' }"
                            default-expand-all
                            ref="permissionTree"
                        />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="showPermission = false">取消</el-button>
                        <el-button type="primaty" @click="handlePermissionSubmit">确定</el-button>
                    </span>
                </template>
        </el-dialog>
    </div>
</template>
<script>
import utils from "../utils/utils"
export default {
    name: "role",
    data() {
        return {
            queryForm: {
                roleName: "",
            },
            columns: [
                {
                    label: "角色名称",
                    prop:"roleName",
                    width:180
                },
                {
                    label: "备注",
                    prop: "remark",
                },
                {
                    label: "权限列表",
                    prop: "permissionList",
                    formatter: (row, column, value) => {
                        let names = [];
                        let list = value.halfCheckedKeys || [];
                        list.map((key) => {
                            let name = this.actionMap[key];
                            if (key && name) names.push(name);
                        });
                        return names.join(",");
                    }
                },
                {
                    label: "创建时间",
                    prop: "createTime",
                    formatter(row, column, value) {
                        return utils.formateDate(new Date(value));
                    },
                    width: 180,
                },
                {
                    label: "更新时间",
                    prop: "updateTime",
                    formatter(row, column, value) {
                        return utils.formateDate(new Date(value));
                    },
                    width: 180,
                }
            ],
            roleList: [],
            pager: {
                total: 0,
                pageSize: 10,
            },
            showModal: false,
            roleForm: {},
            rules: {
                roleName: [
                  
                        {
                            required:true,
                            message: "请输入角色名称",
                            trigger: "blur"
                        }
                  
                ],
            },
            action: "",
            showPermission: false,
            curRoleId: "",
            menuList: [],
            actionMap: {},
        };
    },
    mounted() {
        this.getRoleList();
        // console.log(this.roleList);

        this.getMenuList();
    },
    methods: {
        async getRoleList() {
            const { list, page } = await this.$api.roleList({
                ...this.pager,
                ...this.queryForm,
            });
            this.roleList = list;

            this.pager.total = page.total;
        },
        async handelDelete(_id) {
            await this.$api.roleOperate({_id, action: "delete" });
            this.$message.success("删除成功");
            this.getRoleList();
        },
        handleAdd() {
            this.showModal = true;
            this.action = "create";
        },
        handleRoleQuery() {},
        handleReset(form) {
            this.$refs[form].resetFields();
        },
        handleCloseDialog() {
            this.handleReset("dialogForm");
            this.showModal = false;
        },
        handleClose() {
            this.handleReset("dialogForm");
            this.showModal = false;
        },
        handleEdit(row) {
            this.action = "edit";
            this.showModal = true;
            this.$nextTick(() => {
                this.roleForm = {
                    _id: row._id,
                    remark: row.remark,
                    roleName: row.roleName,
                }
            })
        },
        async handleDel(_id) {
            await this.$api.roleOperate({ _id, acton: "delete"});
            this.$message.success("删除成功");
            this.getRoleList();
        },
        handleSubmit() {
            this.$refs.dialogForm.validate(async (valid) => {
                if (valid) {
                    let { roleForm, action } = this;
                    let params = {...roleForm, action };
                    let res = await this.$api.roleOperate(params);
                    if (res) {
                        this.showModal = false;
                        this.$message.success("创建成功");
                        this.handleReset("dialogForm");
                        this.getRoleList()
                    }
                }
            })
        },
        handleCurrentChange(current) {
            this.pager.pageNum = current;
            this.getRoleList();
        },
        // 设置权限模态框
        handlePermissionClose() {
            this.showPermission = false
        },
        // 设置权限按钮
        handlePermission(row) {
            // 拿到数据
            this.curRoleId = row._id;
            // 
            this.curRoleName = row.roleName;
            this.showPermission = true;
            // 取出来
            const { checkedKeys } = row.permissionList;
            setTimeout(() => {
                // 设置节点
                this.$refs.permissionTree.setCheckedKeys(checkedKeys);
            });
        },
        async getMenuList() {
            const list = await this.$api.menuList();
            this.menuList = list;
            this.getActionMap(list)
        },
        // 确定、提交
        async handlePermissionSubmit() {
            // 获取选中节点的key组成的数组
            let nodes = this.$refs.permissionTree.getCheckedNodes();
            // 获取半选中节点的key组成的数组
            let halfKeys = this.$refs.permissionTree.getHalfCheckedKeys();
            let checkedKeys = [];
            let parentKeys = [];
            // 
            nodes.map((node) => {
                // 没有children 
                if (!node.children) {
                    // 按钮
                    checkedKeys.push(node._id);
                } else {
                    parentKeys.push(node._id);
                }
            });
            // 定义设置接口的
            let params = {
                _id: this.curRoleId,
                // 接口数据
                permissionList: {
                    checkedKeys,
                    halfCheckedKeys: parentKeys.concat(halfKeys),
                }
            };
            // 调接口
            await this.$api.updatePermission(params);
            // 控制模态框的显示
            this.showPermission = false;
            this.$message.success("设置成功");
            this.getRoleList()
        },
        getActionMap(list) {
            let actionMap = {};
            const deep = (arr) => {
                while (arr.length) {
                    let item = arr.pop(); // 弹出最后一项
                    if (item.children && item.action) {
                        actionMap[item._id] = item.menuName;
                    }
                    if (item.children && !item.children) {
                        deep(item.children) //递归调用
                    }
                }
            };
            deep(JSON.parse(JSON.stringify(list)));
            this.actionMap = actionMap;
        }
    }
}
</script>