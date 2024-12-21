const {expect} = require("@playwright/test");
exports.TimesheetsPage = class timesheetsPage {
    constructor(page, apiContext, token) {
        this.page = page;
        this.apiContext = apiContext;
        this.token = token;
        this.myTimesheet = {
            editButton: page.locator('.orangehrm-timesheet-footer--options > button:nth-child(1)'),
            saveButton: page.locator('.orangehrm-timesheet-footer--options > button:nth-child(3)'),
            editTimesheet: {
                projectField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(1) input`),
                activityField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(2) .oxd-select-text-input`),
                dropdownValue: (value) => page.locator(`[role="listbox"] span:has-text("${value}")`),
                monField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(3) input`),
                tueField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(4) input`),
                wedField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(5) input`),
                thuField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(6) input`),
                friField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(7) input`),
                satField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(8) input`),
                sunField: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(9) input`),
                addRowButton: page.locator('table > tbody > tr .oxd-icon.bi-plus'),
            },
            myTimesheetTable: {
                project: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(1) > span`),
                activity: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(2) > span`),
                mon: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(3) > span`),
                tue: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(4) > span`),
                wed: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(5) > span`),
                thu: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(6) > span`),
                fri: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(7) > span`),
                sat: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(8) > span`),
                sun: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td:nth-child(9) > span`),
                totalPerProject: (child) => page.locator(`table > tbody > tr:nth-child(${child}) > td.--highlight.--center`),
                totalPerDay: page.locator('table > tbody > tr.--total .orangehrm-timesheet-table-body-cell.--center:not(.--freeze-right)'),
                total: page.locator('.orangehrm-timesheet-table-body-cell.--center.--freeze-right.--highlight-2'),
            }
        };
    }

    sumTimes(...times) {
        const totalMinutes = times.reduce((sum, time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return sum + hours * 60 + minutes;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }


    async checkTimesheet(data) {
        for (let i = 0; i < data.length; i++) {
            await expect(this.myTimesheet.myTimesheetTable.project(i + 1)).toContainText(data[i].project);
            await expect(this.myTimesheet.myTimesheetTable.activity(i + 1)).toHaveText(data[i].activity);
            await expect(this.myTimesheet.myTimesheetTable.mon(i + 1)).toContainText(data[i].mon);
            await expect(this.myTimesheet.myTimesheetTable.tue(i + 1)).toContainText(data[i].tue);
            await expect(this.myTimesheet.myTimesheetTable.wed(i + 1)).toContainText(data[i].wed);
            await expect(this.myTimesheet.myTimesheetTable.thu(i + 1)).toContainText(data[i].thu);
            await expect(this.myTimesheet.myTimesheetTable.fri(i + 1)).toContainText(data[i].fri);
            await expect(this.myTimesheet.myTimesheetTable.sat(i + 1)).toContainText(data[i].sat);
            await expect(this.myTimesheet.myTimesheetTable.sun(i + 1)).toContainText(data[i].sun);
            await expect(this.myTimesheet.myTimesheetTable.totalPerProject(i + 1))
                .toHaveText(this.sumTimes(data[i].mon, data[i].tue, data[i].wed, data[i].thu, data[i].fri, data[i].sat, data[i].sun));
        }
    }

    async addTimesheet(data, index) {
        await this.myTimesheet.editTimesheet.projectField(index).fill(data.project);
        await this.myTimesheet.editTimesheet.dropdownValue(data.project).click();
        await this.myTimesheet.editTimesheet.activityField(index).click();
        await this.myTimesheet.editTimesheet.dropdownValue(data.activity).click();
        await this.myTimesheet.editTimesheet.monField(index).fill(data.mon);
        await this.myTimesheet.editTimesheet.tueField(index).fill(data.tue);
        await this.myTimesheet.editTimesheet.wedField(index).fill(data.wed);
        await this.myTimesheet.editTimesheet.thuField(index).fill(data.thu);
        await this.myTimesheet.editTimesheet.friField(index).fill(data.fri);
        await this.myTimesheet.editTimesheet.satField(index).fill(data.sat);
        await this.myTimesheet.editTimesheet.sunField(index).fill(data.sun);
    }

    async clickSaveTimesheet() {
        await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/timesheets/') &&
                response.status() === 200),
            this.myTimesheet.saveButton.click(),
        ]);
    }

    async addCustomerWithApi(data) {
        const response = await this.apiContext.post('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/customers',
            {
                data: data,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        expect(response.status()).toBe(200);
    }

    async getCustomerIdByDataWithApi(data) {
        const response = await this.apiContext.get('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/customers?limit=500',
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        const customerList = await response.json();
        let id;
        customerList.data.map(e => {
            if (e.description === data.description && e.name === data.name)
                id = e.id;
        });
        return id;
    }

    async addProjectWithApi(data) {
        const response = await this.apiContext.post('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/projects',
            {
                data: data,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        expect(response.status()).toBe(200);
    }

    async getProjectIdByDataWithApi(data) {
        const response = await this.apiContext.get('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/projects?limit=500&offset=0&sortField=project.name&sortOrder=ASC&model=detailed',
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        const projectList = await response.json();
        let id;
        projectList.data.map(e => {
            if (e.name === data.name && e.customer.id === data.customerId)
                id = e.id;
        });
        return id;
    }

    async addActivitiesInProjectWithApi(projectId, name) {
        const response = await this.apiContext.post(`https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/time/project/${projectId}/activities`,
            {
                data: {
                    name: name,
                },
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            });
        expect(response.status()).toBe(200);
    }
}