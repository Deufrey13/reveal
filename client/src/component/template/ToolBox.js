import React, {useState} from 'react';
import { Menu, Button, message} from 'antd';
import {
  AppstoreAddOutlined,
  UserAddOutlined,
  FontSizeOutlined,
  PictureOutlined,
  FileImageOutlined,
  // UserOutlined,
  // BankOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

const { SubMenu } = Menu;
const rootSubmenuKeys = ['addElement', 'addVariable'];

const dynamicValues = [{
  value: "firstname",
  title: "Prénom"
},{
  value: "lastname",
  title: "Nom"
},{
  value: "birth_date",
  title: "Date de naissance"
},{
  value: "curriculum",
  title: "Cursus"
},{
  value: "promo",
  title: "Promo"
},{
  value: "year",
  title: "Année"
},{
  value: "mention",
  title: "Mention"
}]

const ToolBox = () => {
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState([]);
  const onOpenChange = keys => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const requiredElements = useSelector(state => state.requiredElements)

  const handleImageChange = (e, type) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if(file){
      if(!file.type.includes("image")) message.error(`Nous n'acceptons pas ${file.name} car il n'est pas un .jpg ou .png 😔`);
      reader.onloadend = () => {
        dispatch({ type: 'addElements', elementType: type, imagePreview: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDynamicValue = (dynamicValue) => {
    dispatch({ type: 'addRequiredElement', payload: dynamicValue })
    dispatch({ type: 'addElements', elementType: "dynamic", dynamicType: dynamicValue })
  }

  return (
    <div style={styles.toolBox}>
        <Button type="primary" onClick={()=>setCollapsed(!collapsed)} style={{ marginBottom: 16 }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
        </Button>
        <Menu
          id="toolbox-menu"
          defaultSelectedKeys={['1']}
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          openKeys={openKeys} 
          onOpenChange={onOpenChange}
        >
          <SubMenu key="addElement" icon={<AppstoreAddOutlined />} title="Ajouter un élément">
            <Menu.Item key="text" icon={<FontSizeOutlined />} onClick={()=> {dispatch({ type: 'addElements', elementType: "text" })}}>Texte</Menu.Item>
            <Menu.Item key="image" icon={<PictureOutlined />} onClick={()=> {document.getElementById('fileUpload').click()}}>
              Image
              <input style={{display: "none"}} type="file" name="fileUpload" id="fileUpload" onChange={(e) => handleImageChange(e, "image")} />
            </Menu.Item>
            <Menu.Item key="bgImage" icon={<FileImageOutlined />}  onClick={()=> {document.getElementById('backgroundUpload').click()}}>
              Image de fond
              <input style={{display: "none"}} type="file" name="backgroundUpload" id="backgroundUpload" onChange={(e) => handleImageChange(e, "imageBackground")} />
            </Menu.Item>
          </SubMenu>
          <SubMenu key="addVariable" icon={<UserAddOutlined />} title="Ajouter une variable">
              {dynamicValues.map(dynamicValue => {
                const check = requiredElements.findIndex(e => e.value === dynamicValue.value)
                if(check >= 0) return null
                return <Menu.Item key={dynamicValue.value} onClick={()=> handleDynamicValue(dynamicValue)}>{dynamicValue.title}</Menu.Item>
              })}
          </SubMenu>
        </Menu>
      </div>
  );
}
export default ToolBox;

const styles = {
  toolBox:{
    position: "fixed",
    maxHeight: "calc(100vh - 190px)",
    zIndex: 2
  }
}


/* <Menu.Item key="text" icon={<FontSizeOutlined />} onClick={()=> {dispatch({ type: 'addElements', elementType: "text" })}}>Texte</Menu.Item>
<Menu.Item key="image" icon={<PictureOutlined />} onClick={()=> {document.getElementById('fileUpload').click()}}>
  Image
  <input style={{display: "none"}} type="file" name="fileUpload" id="fileUpload" onChange={(e) => handleImageChange(e, "image")} />
</Menu.Item>
<Menu.Item key="bgImage" icon={<FileImageOutlined />}  onClick={()=> {document.getElementById('backgroundUpload').click()}}>
  Image de fond
  <input style={{display: "none"}} type="file" name="backgroundUpload" id="backgroundUpload" onChange={(e) => handleImageChange(e, "imageBackground")} />
</Menu.Item> */