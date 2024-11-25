class APIUtils {
    constructor(apiContext, token) {
        this.apiContext = apiContext;
        this.token = token;
    }

    async addUser(userData) {
        const response = await this.apiContext.post(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users',
            {
                data: userData,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
        const userDetails = await response.json();
        return userDetails.data;
    }

    async editUser(userId, userData) {
        await this.apiContext.put(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users/' + userId,
            {
                data: userData,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    async deleteUser(userIds) {
        await this.apiContext.delete(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/users',
            {
                data: {
                    ids: userIds,
                },
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    async getEmployees() {
        const response = await this.apiContext.get(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees?limit=500&offset=0&model=detailed&includeEmployees=onlyCurrent&sortField=employee.firstName&sortOrder=ASC',
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        )
        const employeesList = await response.json();
        return employeesList.data;
    }

    async addNewsfeed(text) {
        const response = await this.apiContext.post(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/buzz/posts',
            {
                data: text,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
        const postId = await response.json();
        return postId.data.post.id;
    }

    async getNewsfeeds() {
        const response = await this.apiContext.get(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/buzz/feed?limit=100&offset=0&sortOrder=DESC&sortField=share.createdAtUtc',
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        )
        const newsfeedsList = await response.json();
        return newsfeedsList.data;
    }

    async deleteNewsfeed(newsfeedId) {
        const newsfeedsList = await this.getNewsfeeds();
        let response;

        newsfeedsList.map(async (e) => {
            if (e.post.id === newsfeedId)
                response = await this.apiContext.delete('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/buzz/shares/' + e.id,
                    {
                        headers: {
                            'cookie': 'orangehrm=' + this.token,
                            'Content-Type': 'application/json',
                        },
                    }
                );
        });
    }

    async addSkill(text) {
        const response = await this.apiContext.post(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills',
            {
                data: text,
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
        const skillId = await response.json();
        return skillId.data.id;
    }

    async getSkills() {
        const response = await this.apiContext.get(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills?limit=500&offset=0',
            {
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        )
        const employeesList = await response.json();
        return employeesList.data;
    }

    async deleteSkill(userIds) {
        await this.apiContext.delete(
            'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/admin/skills',
            {
                data: {
                    ids: userIds,
                },
                headers: {
                    'cookie': 'orangehrm=' + this.token,
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

module.exports = {APIUtils};