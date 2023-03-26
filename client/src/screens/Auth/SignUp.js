import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { FormControl , TextField ,  Box, Typography , Select , MenuItem , Radio , RadioGroup , FormControlLabel } from '@material-ui/core';
import { Spacing, Container } from 'styles/Layout';
import { H1, Error } from 'styles/Text';
import { Button } from 'styles/Form';

import Head from 'components/shared/Head';

import { SIGN_UP } from 'graphql/user';

import * as Routes from 'routes';

const Root = styled(Container)`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 40px;

    @media (min-width: ${(p) => p.theme.screen.md}) {
        justify-content: space-between;
        margin-top: 137px;
    }
`;

const Welcome = styled.div`
    display: none;
    flex-direction: column;
    color: #1c1e21;
    max-width: ${(p) => p.theme.screen.xs};

    @media (min-width: ${(p) => p.theme.screen.md}) {
        display: flex;
    }
`;

const Heading = styled(H1)`
    margin-bottom: ${(p) => p.theme.spacing.sm};
`;

const Form = styled.div`
    position: relative;
    top: 50px;
    width: 430px;
    padding: 15px;
    padding: ${(p) => p.theme.spacing.md};
    border-radius: ${(p) => p.theme.radius.sm};
    border-radius: 12px;
    background: #fff;
    box-shadow:  0 0 5px 0 #ddd;

    @media (min-width: ${(p) => p.theme.screen.sm}) {
        width: 450px;
    }

    .birthCaption{
        display: flex;
        align-items: center;
        margin: 5px 0;
        color: grey;   
    }

    .MuiTextField-root{
        margin:5px;
    }
    .MuiFormControl-fullWidth{
        margin: 0 5px;
        .MuiSelect-root{
            padding: 10px;
        }
    }
    .Mui-error{
        margin-left: 0;
    }
`;

const BoxCus = styled(Box)`
    margin: 15px 0;
    .Gender{
        >div{
            width: 100%;
        }
        .RadioGroup{
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
            overflow: hidden;
            label{
                width: 90px;
                display: flex;
                justify-content: center;
                border: 1px solid #ddd;
                padding: 8px 20px;
                border-radius: 5px;
                margin: 0;
                .MuiRadio-root{
                    padding: 0;
                    margin-right: 5px;
                }
            }
        }
    }
`;


/**
 * Sign Up
 */
const SignUp = ({ history, refetch }) => {
    const [error, setError] = useState('');
    const [values, setValues] = useState({
        firstName: '',
        lastName: '',
        fullName: '',
        username: '',
        email: '',
        password: '',
        day:"",
        month:"",
        year:"",
        gender:'',
    });
    const [signup, { loading }] = useMutation(SIGN_UP);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };
    
    



    const validate = () => {
        if (!firstName || !lastName || !email || !username || !password) {
            return 'Hãy điền thông tin tất cả các trường';
        }

        if ((firstName).length > 50) {
            return 'Họ đầy đủ không quá 50 ký tự';
        }

        if ((lastName).length > 50) {
            return 'Tên đầy đủ không quá 50 ký tự';
        }

        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(String(email).toLowerCase())) {
            return 'Nhập địa chỉ email hợp lệ.';
        }

        const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
        if (!usernameRegex.test(username)) {
            return 'Tên đăng nhập chỉ có thể sử dụng chữ cái, số, dấu gạch dưới và dấu chấm';
        } else if (username.length > 20) {
            return 'Tên đăng nhập không quá 50 ký tự';
        }

        if (password.length < 6) {
            return 'Mật khẩu tối thiểu 6 ký tự';
        }

        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validate();
        if (error) {
            setError(error);
            return false;
        }

        try {
            const response = await signup({
                variables: { input: { fullName: firstName.concat(' ', lastName), email, password, username, 
                birthDay: "ngày " + day + " " + month + " năm " + year, gender } },
            });
            localStorage.setItem('token', response.data.signup.token);
            await refetch();
            history.push(Routes.HOME);
        } catch (error) {
            setError(error.graphQLErrors[0].message);
        }
    };

    const Months = ["Tháng 1" , "Tháng 2" , "Tháng 3" , "Tháng 4" , "Tháng 5" , "Tháng 6" , "Tháng 7" ,
     "Tháng 8" , "Tháng 9" , "Tháng 10" , "Tháng 11" , "Tháng 12"];

    var currentTime = new Date();

    const {firstName, lastName, email, password, username, year, month, day, gender } = values;
    return (
        <Root maxWidth="lg">
            <Head />

            <Welcome>
                <div>
                    <Heading color="#1c1e21">Kết nối với bạn bè và thế giới xung quanh bạn.</Heading>
                </div>

                <p>Xem ảnh và cập nhật từ bạn bè của bạn.</p>
                <p>Làm theo sở thích của bạn.</p>
                <p>Nghe những gì mọi người đang nói về thế giới.</p>
            </Welcome>

            <Form>
                <Spacing bottom="md">
                    <H1>Tạo tài khoản</H1>
                </Spacing>

                <form onSubmit={(e) => handleSubmit(e, signup)}>
                    <FormControl>
                        <Box className='nameFields' display='flex' justifyContent='center'>
                            <TextField 
                                type="text"
                                name="firstName"
                                values={firstName}
                                onChange={handleChange}
                                placeholder="Họ"
                                bordercolor="white"
                            />
                            <TextField 
                                type="text"
                                name="lastName"
                                values={lastName}
                                onChange={handleChange}
                                placeholder="Tên"
                                bordercolor="white"
                                style={{marginLeft:"5px"}}
                            />
                        </Box>
                        <TextField 
                            type="text"
                            name="email"
                            values={email}
                            onChange={handleChange}
                            placeholder="Email"
                            bordercolor="white"
                        />
                        <TextField 
                            type="text"
                            name="username"
                            values={username}
                            onChange={handleChange}
                            placeholder="Tài khoản đăng nhập"
                            bordercolor="white"
                        />
                        <TextField 
                            type="password"
                            name="password"
                            values={password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            bordercolor="white"
                        />
                    </FormControl>
                    
                    <Typography className='birthCaption' display='block' variant='caption'>Sinh nhật</Typography>
                    <Box className='birth' display='flex' >
                        <FormControl fullWidth>
                            <Select
                                name='day'
                                value={values.day ? values.day : currentTime.getDate() }
                                onChange={handleChange}
                                variant='outlined'
                                error={error.day ? true : false} 
                                >
                                {[...Array(31)].map((num,i) => (
                                    <MenuItem  key={i}  value={`${i+1}`} >{i+1}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <Select
                                name='month'
                                value={values.month ? values.month : Months[currentTime.getMonth()] }
                                onChange={handleChange}
                                variant='outlined'
                                error={error.month ? true : false} 
                            >
                                {Months.map((month ,i) => (
                                    <MenuItem key={i} value={month}>{month}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth onClick={(e) => e.stopPropagation()} >
                            <Select
                                name='year'
                                value={values.year ? values.year : currentTime.getFullYear() }
                                onChange={handleChange}
                                variant='outlined'
                                error={error.year ? true : false}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {[...Array(currentTime.getFullYear()-1904)].map((num,i) => (
                                    <MenuItem  key={i}  value={`${ currentTime.getFullYear()-i}`} >{currentTime.getFullYear()-i}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <BoxCus className='GenderContainer'>
                        <Typography className='birthCaption Gender' display='block' variant='caption'>Giới tính</Typography>
                        <Box className='Gender' display='flex' >
                            <FormControl>
                                <RadioGroup name='gender' className='RadioGroup' defaultValue="male" onChange={handleChange}  >
                                    <FormControlLabel  value='Nam' control={<Radio  size='small' color='primary' />} label='Nam' />
                                    <FormControlLabel value='Nữ' control={<Radio size='small' color='primary' />} label='Nữ' />
                                    <FormControlLabel value='Tùy chỉnh' control={<Radio size='small'   color='primary' />} label='Tùy chỉnh' />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </BoxCus>
                    {error && (
                        <Spacing bottom="sm" top="sm">
                            <Error>{error}</Error>
                        </Spacing>
                    )}
                    <Spacing top="sm" />
                    <Button size="large" disabled={loading}>
                        Sign up
                    </Button>
                </form>
            </Form>
        </Root>
    );
}

SignUp.propTypes = {
    history: PropTypes.object.isRequired,
    refetch: PropTypes.func.isRequired,
};

export default withRouter(SignUp);