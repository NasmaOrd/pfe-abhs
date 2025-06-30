*** Settings ***
Library           RequestsLibrary
Library           OperatingSystem

*** Keywords ***
Create Session
    [Arguments]    ${alias}    ${url}
    Create Session    ${alias}    ${url}

Upload File
    [Arguments]    ${station_id}    ${file}
    ${path}=    Get File    ${file}
    ${resp}=    Post Request    alias=api    uri=/upload?stationId=${station_id}    files={"file": "${path}"}
    Should Be Equal As Integers    ${resp.status_code}    200

Reset Password Request
    [Arguments]    ${email}
    ${resp}=    Post Request    api    /api/auth/request-reset    json={"email": "${email}"}
    Should Be Equal As Integers    ${resp.status_code}    200

Approve Password Reset
    [Arguments]    ${email}
    ${resp}=    Post Request    api    /api/auth/approve-reset    json={"email": "${email}"}
    ${status}=    Convert To Integer    ${resp.status_code}
    Run Keyword Unless    '${status}' == '200' or '${status}' == '404'    Fail    Lien non généré
