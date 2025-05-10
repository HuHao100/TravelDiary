import React from "react";
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import {Input} from "antd";
import {Pagination} from "antd";
const { Header, Content, Footer } = Layout;
const { Search } = Input;

export default function Home() {
    return (
        <Layout>
      <Header
        
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#fff'
        }}
      >
        
        <Menu
            theme="light"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={[
            { key: '1', label: '待审核' },
            { key: '2', label: '已审核' },
            { key: '3', label: '回收站' },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0 48px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>审核列表</Breadcrumb.Item>
          <Breadcrumb.Item>待审核</Breadcrumb.Item>           
        </Breadcrumb>
        <Search  
        size="large"
        placeholder="搜索游记标题/内容"
        enterButton="搜索"
        />
        <div
          style={{
            padding: 24,
            minHeight: 380,
            background: '#fff',
            borderRadius: "8px",
          }}
        >
          审核列表
        </div>
        <Pagination
                    style={{ marginTop: 16, textAlign: 'center' }}
                    defaultCurrent={1}
                    total={50} // 假设有 50 条数据
                    pageSize={10} // 每页显示 10 条
                />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        {new Date().getFullYear()}@jierwusha
      </Footer>

    </Layout>
        
    );
}