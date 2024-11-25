let orangehrmliveLocators = {
    toastMessage: '.oxd-toast-start p:nth-child(2)',
    loginPage: {
        nameField: '[name="username"]',
        passwordField: '[type="password"]',
        loginButton: '[type="submit"]',
    },
    userTopMenu: {
        menuButton: '.oxd-userdropdown-name',
        logOutButton: '.oxd-dropdown-menu > li:nth-child(4)',
    },
    navigation: '.oxd-main-menu > li span:text-is("namePage")',
    deleteButton: '.orangehrm-horizontal-padding.orangehrm-vertical-padding button',
    deleteModal: {
        yes: '.orangehrm-modal-footer > button:nth-child(2)',
    },
    adminPage: {
        topMenu: {
            job: {
                jobButton: '[aria-label="Topbar Menu"] > ul > li:nth-child(2)',
                jobTitleButton: '[aria-label="Topbar Menu"] > ul > li:nth-child(2) > ul > li:nth-child(1) > a',
            },
        },
        jobTitlesPage: {
            addButton: '.orangehrm-header-container button',
            addForm: {
                jobTitleField: '.oxd-form > div:nth-child(1) input',
                jobDescriptionField: '.oxd-form > div:nth-child(2) textarea',
                saveButton: '[type="submit"]',
            },
            table: {
                checkBox: '.oxd-table-body > div > div > div:nth-child(1) i',
                title: '.oxd-table-body > div > div > div:nth-child(2) > div',
                description: '.oxd-table-body > div > div > div:nth-child(3) > div',
            },
        },
        users: {
            table: {
                nameRow: '.oxd-table > div:nth-child(2) > div > div > div:nth-child(2) > div',
                userRole: '.oxd-table > div:nth-child(2) > div > div > div:nth-child(3) > div',
                employeeRow: '.oxd-table > div:nth-child(2) > div > div > div:nth-child(4) > div',
                statusRow: '.oxd-table > div:nth-child(2) > div > div > div:nth-child(5) > div',
            },
            filters: {
                nameField: '.oxd-table-filter input:nth-child(1)',
                searchButton: '.oxd-form-actions > button:nth-child(2)',
            },
            addNewUser: {
                addNewUserButton: '.orangehrm-header-container > button',
                userRoleDropdown: '.oxd-form > div:nth-child(1) > div > div:nth-child(1) .oxd-select-text-input',
                statusDropdown: '.oxd-form > div:nth-child(1) > div > div:nth-child(3) .oxd-select-text-input',
                dropdownValue: '[role="listbox"] span:text-is("value")',
                employeeName: {
                    field: '[placeholder="Type for hints..."]',
                    list: '[role="option"] > span',
                },
                userNameField: '.oxd-form > div:nth-child(1) > div > div:nth-child(4) input',
                passwordField: '.user-password-row > div > div:nth-child(1) input',
                confirmPasswordField: '.user-password-row > div > div:nth-child(2) input',
                saveButton: '.oxd-form-actions [type="submit"]',
            },
        },
        skills: {
            table: {
                name: '[role="table"] .oxd-table-body div > [role="cell"]:nth-child(2) > div',
                description: '[role="table"] .oxd-table-body div > [role="cell"]:nth-child(3) > div',
                editButton: '[role="table"] .oxd-table-body div > [role="cell"]:nth-child(4) button:nth-child(2)',
            },
            addEditForm: {
                nameField: '.oxd-form-row .oxd-input',
                descriptionField: 'div textarea',
                saveButton: '.oxd-form-actions button:nth-child(3)',
            },
        },
    },
    recruitmentPage: {
        topMenu: {
            vacancies: '[aria-label="Topbar Menu"] li:nth-child(2) > a',
        },
        vacancies: {
            addButton: '.orangehrm-header-container button',
            addForm: {
                vacancyNameField: '.oxd-form > div:nth-child(1) > div:nth-child(1) input',
                jobTitleDropdown: '.oxd-form > div:nth-child(1) > div:nth-child(2) .oxd-select-text-input',
                dropdownValue: '[role="listbox"] span',
                hiringManagerField: {
                    field: '[placeholder="Type for hints..."]',
                    list: '[role="option"] > span',
                },
                saveButton: '[type="submit"]',
            },
            table: {
                checkBox: '.oxd-table-body [role="row"] > div:nth-child(1) span',
                vacancy: '.oxd-table-body [role="row"] > div:nth-child(2) > div',
                jobTitle: '.oxd-table-body [role="row"] > div:nth-child(3) > div',
                hiringManager: '.oxd-table-body [role="row"] > div:nth-child(4) > div',
                status: '.oxd-table-body [role="row"] > div:nth-child(5) > div',
            },
        },
        candidates: {
            filters: {
                candidateNameField: '[placeholder="Type for hints..."]',
                list: '[role="option"] > span',
                searchButton: '[type="submit"]',
            },
            table: {
                checkBox: '[role="table"] .oxd-table-body > div > div > div:nth-child(1) span',
                vacancy: '[role="table"] .oxd-table-body > div > div > div:nth-child(2) > div',
                candidate: '[role="table"] .oxd-table-body > div > div > div:nth-child(3) > div',
                hiringManager: '[role="table"] .oxd-table-body > div > div > div:nth-child(4) > div',
                status: '[role="table"] .oxd-table-body > div > div > div:nth-child(6) > div',
            }
        },
    },
    publishVacancyPage: {
        applyButton: '.orangehrm-container > div:has(.orangehrm-vacancy-card-header p:text-is("VacancyName")) button',
        addForm: {
            firstNameField: '[name="firstName"]',
            lastNameField: '[name="lastName"]',
            emailField: '[name="email"]',
            resumeField: '[type="file"]',
            submitButton: '[type="submit"]',
        },
    },
    buzzPage: {
        posts: {
            body: '.orangehrm-buzz-post-body .orangehrm-buzz-post-body-text',
        }
    },
}

export {orangehrmliveLocators}