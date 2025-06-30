*** Settings ***
Library    OperatingSystem
Library    Process
Library    Collections
Library    String
Library    DateTime

*** Variables ***
${SYNC_SCRIPT}           server.js
${EXCEL_PATH}           data/data.xlsx
${TEST_EXCEL}           test_data.xlsx
${SPREADSHEET_ID}       1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw
${CREDENTIALS}          credentials.json
${TEST_TIMEOUT}         30s

*** Test Cases ***
Test Synchronisation Fichier Valide
    [Documentation]    Vérifie que la synchronisation fonctionne avec un fichier Excel valide
    [Setup]    Préparer Fichier Test    ${TEST_EXCEL}
    
    # Démarrer le script en arrière-plan
    ${process}=    Start Process    node    ${SYNC_SCRIPT}    cwd=${CURDIR}
    
    # Modifier le fichier pour déclencher la synchro
    Create File    ${EXCEL_PATH}    ${CURDIR}/${TEST_EXCEL}
    
    # Vérifier la synchronisation
    ${result}=    Wait For Process    ${process}    timeout=${TEST_TIMEOUT}
    Should Contain    ${result.stdout}    ✅ Google Sheet mis à jour
    
    [Teardown]    Nettoyer Fichier Test

Test Fichier Excel Vide
    [Documentation]    Teste le comportement avec un fichier Excel vide
    [Setup]    Préparer Fichier Test    empty.xlsx
    
    ${process}=    Start Process    node    ${SYNC_SCRIPT}    cwd=${CURDIR}
    Create File    ${EXCEL_PATH}    ${CURDIR}/empty.xlsx
    
    ${result}=    Wait For Process    ${process}    timeout=${TEST_TIMEOUT}
    Should Contain    ${result.stdout}    ⚠️ Fichier Excel vide
    
    [Teardown]    Nettoyer Fichier Test

Test Fichier Non Existant
    [Documentation]    Teste le comportement quand le fichier Excel n'existe pas
    ${process}=    Start Process    node    ${SYNC_SCRIPT}    cwd=${CURDIR}
    
    ${result}=    Wait For Process    ${process}    timeout=${TEST_TIMEOUT}
    Should Contain    ${result.stdout}    ❌ Le fichier Excel n'existe pas

Test Format Données Invalide
    [Documentation]    Teste avec un fichier corrompu
    [Setup]    Préparer Fichier Test    invalid_data.xlsx
    
    ${process}=    Start Process    node    ${SYNC_SCRIPT}    cwd=${CURDIR}
    Create File    ${EXCEL_PATH}    Fichier non valide
    
    ${result}=    Wait For Process    ${process}    timeout=${TEST_TIMEOUT}
    Should Contain    ${result.stdout}    ❌ Erreur pendant la synchronisation
    
    [Teardown]    Nettoyer Fichier Test

*** Keywords ***
Préparer Fichier Test
    [Arguments]    ${filename}
    # Crée un fichier Excel de test valide
    ${data}=    Set Variable    Nom,Age,Email\nTest1,30,test1@example.com\nTest2,25,test2@example.com
    Create File    ${CURDIR}/${filename}    ${data}

Nettoyer Fichier Test
    Run Keyword And Ignore Error    Remove File    ${EXCEL_PATH}
    Run Keyword And Ignore Error    Remove File    ${CURDIR}/empty.xlsx
    Run Keyword And Ignore Error    Remove File    ${CURDIR}/invalid_data.xlsx