import React, { useState } from "react";
import { Card, Button, Typography, message } from "antd";
import axios from "axios";
import { Layout } from "antd";
import AuditorHeader from "../../components/layout/AuditorHeader";
import AuditorSidebar from "../../components/layout/AuditorSidebar";

const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL;

const OpenFinancialYear: React.FC = () => {

  const [loading, setLoading] = useState(false);

  const societyId = Number(sessionStorage.getItem("societyId"));
  const accountingYearId = Number(sessionStorage.getItem("financialYearId"));
  const username = sessionStorage.getItem("userName");

  

  const openFinancialYear = async () => {
    console.log("button cliked")
try {
  setLoading(true);

  console.log({
    societyId,
    accountingYearId,
    username,
  });

  const response = await axios.post(
    `${BASE_URL}/accounting-year/open`,
    {
      societyId,
      accountingYearId,
      username,
    }
  );

  message.success(response.data.message || response.data);

} catch (error: any) {

  if (error.response) {
    message.error(
      error.response.data.message || "Unable to open financial year"
    );
  } else {
    message.error("Something went wrong");
  }

} finally {
  setLoading(false);
}
  }
 const { Content } = Layout;

 
 

return (
  <Layout style={{ minHeight: "100vh" }}>
    <Layout.Sider
      width={250}
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      <AuditorSidebar />
    </Layout.Sider>

    <Layout>
      <AuditorHeader />

      <Content style={{ padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
          }}
        >
          {/* Your existing content */}

          <Title level={3}>Open Financial Year</Title>

          <Button
            type="primary"
            loading={loading}
            onClick={openFinancialYear}
            
          >
            Open Financial Year
          </Button>

        </Card>
      </Content>
    </Layout>
  </Layout>
);

};

export default OpenFinancialYear;