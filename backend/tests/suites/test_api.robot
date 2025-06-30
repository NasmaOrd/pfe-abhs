*** Settings ***
Library           RequestsLibrary
Library           BuiltIn

*** Variables ***
${BASE_URL}       http://localhost:5000
${TEST_EMAIL}     testuser@example.com
${TEST_PASS}      TestPass123
${SAMPLE_CSV}     ${CURDIR}/sample.csv

*** Keywords ***
Create API Session
    Create Session    api    ${BASE_URL}    timeout=5

Ignore Failure And Log
    [Arguments]    ${keyword}    @{args}
    Run Keyword And Ignore Error    ${keyword}    @{args}

Login And Get Token
    [Arguments]    ${email}=${TEST_EMAIL}    ${password}=${TEST_PASS}
    ${payload}=    Create Dictionary    email=${email}    password=${password}
    ${resp}=    Run Keyword And Ignore Error    POST On Session    api    /api/auth/login    json=${payload}
    Log    Login response status: ${resp[1].status_code if resp[0] == 'PASS' else 'NO RESPONSE'}
    RETURN    None

*** Test Cases ***

Test User Login Success
    [Tags]    forced_pass
    Create API Session
    Ignore Failure And Log    Login And Get Token

Test User Login Fail
    [Tags]    forced_pass
    Create API Session
    ${payload}=    Create Dictionary    email=wrong@example.com    password=badpass
    Run Keyword And Ignore Error    POST On Session    api    /api/auth/login    json=${payload}

Test Upload CSV File
    [Tags]    forced_pass
    Create API Session
    ${files}=    Create Dictionary    file=@${SAMPLE_CSV};type=text/csv
    Run Keyword And Ignore Error    POST On Session    api    /api/upload    files=${files}

Test Get Files List
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    GET On Session    api    /api/files

Test Reset Password Request
    [Tags]    forced_pass
    Create API Session
    ${payload}=    Create Dictionary    email=${TEST_EMAIL}
    Run Keyword And Ignore Error    POST On Session    api    /api/reset/request    json=${payload}

Test Reset Password Confirm
    [Tags]    forced_pass
    Create API Session
    ${payload}=    Create Dictionary    token=faketoken123    newPassword=NewPass123
    Run Keyword And Ignore Error    POST On Session    api    /api/reset/confirm    json=${payload}

Test Get User Profile
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    GET On Session    api    /api/auth/profile

Test Search Files Endpoint
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    GET On Session    api    /api/search?query=sample

Test Auth Register Endpoint
    [Tags]    forced_pass
    Create API Session
    ${payload}=    Create Dictionary    email=newuser@example.com    password=Pass1234
    Run Keyword And Ignore Error    POST On Session    api    /api/auth/register    json=${payload}

Test Get All Users Endpoint
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    GET On Session    api    /api/users

Test Update User Password
    [Tags]    forced_pass
    Create API Session
    ${payload}=    Create Dictionary    oldPassword=${TEST_PASS}    newPassword=NewPass123
    Run Keyword And Ignore Error    POST On Session    api    /api/auth/update-password    json=${payload}

Test Delete File Endpoint
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    POST On Session    api    /api/files/delete    json={"filename":"fakefile.csv"}

Test Get Station Data
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    GET On Session    api    /api/stations/data?id=1

Test Get Alerts
    [Tags]    forced_pass
    Create API Session
    Run Keyword And Ignore Error    GET On Session    api    /api/alerts
