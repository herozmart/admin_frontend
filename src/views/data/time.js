import React, {useState} from 'react';
import {Select, Input} from "antd";

const Time = ({setStart, setEnd}) => {

    const [time, setTime] = useState('Day');
    const handleChangeTime = (value) => setTime(value);

    const handleChangeStart = (value) => setStart(value);

    const handleChangeEnd = (value) => setEnd(value);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Select defaultValue="Day" style={{width: "30%"}} onChange={handleChangeTime}>
                        <Select.Option value="Day">Day</Select.Option>
                        <Select.Option value="Month">Month</Select.Option>
                    </Select>
                    <Select placeholder="start" style={{width: "30%"}} onChange={handleChangeStart}>
                        {
                            time === 'Day' ?
                                ([...Array(31).keys()].map((item, index) => {
                                    return <Select.Option key={index} value={item + 1}>{item + 1}</Select.Option>
                                })) :
                                ((
                                    [...Array(12).keys()].map((item, index) => {
                                        return <Select.Option key={index} value={item + 1}>{item + 1}</Select.Option>
                                    })))
                        }
                    </Select>
                    <Input style={{
                        width: "7%",
                        borderLeft: 0,
                        borderRight: 0,
                        pointerEvents: 'none',
                    }} placeholder="~" disabled/>
                    <Select placeholder="end" style={{width: "33%"}} onChange={handleChangeEnd}>
                        {
                            time === 'Day' ?
                                ([...Array(31).keys()].map((item, index) => {
                                    return <Select.Option key={index} value={item + 1}>{item + 1}</Select.Option>
                                })) :
                                ((
                                    [...Array(12).keys()].map((item, index) => {
                                        return <Select.Option key={index} value={item + 1}>{item + 1}</Select.Option>
                                    })))
                        }
                    </Select>
                </div>
            </div>
        </>

    );
};

export default Time;