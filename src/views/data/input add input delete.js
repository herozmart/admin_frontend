import React, {useEffect, useState} from 'react';
import AddContainer from "../../components/add-container";
import {Button, Form, Input, Modal, Select, Table, Tabs} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import ApiInterceptor from "../../interceptors/api-interceptor";
import {AxiosObject} from "../../helpers/axios";
import {EXTRA_URL, LANGUAGES_ACTIVE_URL} from "../../configs/urls";
import LanguageList from "../../components/language-list";

const ExtrasPage = () => {
    const column = [
        {
            key: "2",
            title: "Key",
            dataIndex: "name",
            render: (text) => {
                return <div>{text[defaultLang]}</div>

            }
        },
        {
            key: "4",
            title: "Value",
            dataIndex: "select",
            render: (select) => {
                return <div>{select}</div>
            }
        },
        {
            key: "5",
            title: "options",
            render: (record) => {
                return (
                    <>
                        <EditOutlined onClick={() => {
                            onEditProduct(record)
                        }}/>
                        <DeleteOutlined onClick={() => {
                            onDeleteProduct(record)
                        }} style={{color: "red", marginLeft: 12}}/>
                    </>
                );
            },
        },
    ];
    // state
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState({id: 0, name: {}, select: ""});
    const [dataSource, setDataSource] = useState([]);
    // language for state
    const [defaultLang, setDefaultLang] = useState("en");
    const [language, setLanguage] = useState([]);

    // ant form
    const [form] = Form.useForm();

    // default language list
    const languageList = async () => {
        await ApiInterceptor(await AxiosObject()).get(LANGUAGES_ACTIVE_URL)
            .then((res) => {
                    setLanguage(res.data.data)
                    if (res.data.data) {
                        setDefaultLang(res.data.data[0].locale)
                    }
                }
            )
    };

    // default language edit
    const onChangeLanguage = ({target: {value}}) => {
        setDefaultLang(value)
        form.setFieldsValue({
            name: editingProduct.name[value],
        })
    };

    const newSelect = (e) => setEditingProduct({...editingProduct, select: e})


    const changeItem = (e) => {
        let nameArray = editingProduct.name;
        nameArray[defaultLang] = e.target.value;
        setEditingProduct((prevState) => {
            return {...prevState, name: nameArray}
        });
    }

    // new product create
    const onAddProduct = () => {
        const randomNumber = parseInt(Math.random() * 50);
        const newProduct = {
            id: randomNumber,
            name: editingProduct.name,
            select: editingProduct.select
        };
        setDataSource((pre) => {
            return [...pre, newProduct];
        });
        setEditingProduct({id: 0, name: {}, select: ""})
    };

    const handleCancel = () => setIsEditing(false)

    // check product and edit
    const editProduct = () => {
        setDataSource((pre) => {
            return pre.map((item) => {
                if (item.id === editingProduct.id) {
                    return editingProduct;
                } else {
                    return item;
                }
            });
        });
    }

    // product delete
    const onDeleteProduct = (record) => {
        Modal.confirm({
            title: "Are you sure, you want to delete this ?",
            okText: "Yes",
            okType: "danger",
            onOk: () => {
                setDataSource((pre) => {
                    return pre.filter((student) => student.id !== record.id);
                });
            },
        });
    };

    const onEditProduct = (record) => {
        setIsEditing(true);
        setEditingProduct({...record});
    };


    useEffect(() => {
        languageList()
    }, [])

    return (
        <AddContainer add={"extras"} edit={"extras"} pathUrl={"extras"}>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Tab 1" key="1">
                    <Form form={form}>
                        <div className="row mb-3">
                            <div className="col-md-12 col-sm-12">
                                <LanguageList value={defaultLang}
                                              languages={language}
                                              onChangeLanguage={onChangeLanguage}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-5">
                                <Form.Item
                                    rules={[{required: true, message: "missing_product_name"}]}
                                    tooltip="enter_product_name"
                                >
                                    <Input className="mb-3" name="name" value={editingProduct?.name[defaultLang]}
                                           onChange={changeItem}/>
                                </Form.Item>

                            </div>
                            <div className="col-lg-5">
                                <Select
                                    style={{"width": "100%"}}
                                    placeholder="Select"
                                    name="select"
                                    defaultValue={'0'}
                                    onChange={newSelect}
                                >
                                    <Select.Option value="0">no</Select.Option>
                                    <Select.Option value="1">1</Select.Option>
                                    <Select.Option value="2">2</Select.Option>
                                    <Select.Option value="3">3</Select.Option>
                                </Select>
                            </div>
                            <div className="col-lg-2">
                                <Button onClick={onAddProduct}
                                        type="primary">save</Button>
                            </div>
                        </div>

                        <Table columns={column} dataSource={dataSource}
                               rowKey={(record) => record.id}/>

                        <Modal closable={false} title="Edit product" visible={isEditing} okText="Save"
                               onCancel={handleCancel}
                               onOk={() => {
                                   editProduct();
                                   handleCancel();
                               }}>
                            <div className="row mb-3">
                                <div className="col-md-12 col-sm-12">
                                    <LanguageList value={defaultLang} languages={language}
                                                  onChangeLanguage={onChangeLanguage}/>
                                </div>
                            </div>
                            <Input className="mb-3" value={editingProduct?.name[defaultLang]} onChange={changeItem}/>
                            <Select
                                style={{"width": "100%"}}
                                placeholder="Select"
                                name="select"
                                defaultValue={editingProduct.select}
                                onChange={newSelect}>
                                <Select.Option value="0">no</Select.Option>
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                            </Select>
                        </Modal>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Tab 2" key="2">

                </Tabs.TabPane>
            </Tabs>
        </AddContainer>
    );
};

export default ExtrasPage;