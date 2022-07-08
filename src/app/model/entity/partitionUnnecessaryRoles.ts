export const partition_unnecessary_roles =
{
    Company: {
        actions: {
            addItem: true,
            updateItem: true,
            getItem: true,
            destroyItem: true,
            getAllItems: true
        }
    },
    AccessPoint: {
        actions: {
            addItem: true,
            updateItem: true,
            destroyItem: true
        }
    },
    AutoTaskSchedule: {
        actions: {
            addItem: true,
            updateItem: true,
            getItem: true,
            destroyItem: true,
            getAllItems: true
        }
    },
    AccessPointGroup: {
        actions: {
            addItem: true,
            updateItem: true,
            getItem: true,
            destroyItem: true,
            getAllItems: true
        }
    },
    AccessPointZone: {
        actions: {
            addItem: true,
            updateItem: true,
            getItem: true,
            destroyItem: true,
            getAllItems: true
        }
    },
    Product: {
        actions: {
            getItem: true,
            getAllItems: true
        }
    },
    Department: {
        actions: {
            getAllItems: true
        }
    },
    Acu: {
        actions: {
            addItem: true,
            updateItem: true,
            getItem: true,
            destroyItem: true,
            getAllItems: true
        }
    },
    RegistrationInvite: {
        actions: {
            createLink: true,
            createCardholderLink: true,
            getByLink: true
        }
    }
}

export function outUnnecessaryRoles (main_roles: any, unneed_roles: any) {
    main_roles = JSON.parse(main_roles)
    Object.keys(unneed_roles).forEach(key => {
        Object.keys(unneed_roles[key].actions).forEach(multikey => {
            if (main_roles[key].actions[multikey]) {
                delete main_roles[key].actions[multikey]
            }
        })
        if (unneed_roles[key].features) {
            Object.keys(unneed_roles[key].features).forEach(feature => {
                if (main_roles[key].features[feature]) {
                    delete main_roles[key].features[feature]
                }
            })
        }
    })
    Object.keys(main_roles).forEach(main_key => {
        if (main_roles[main_key].actions) {
            if (Object.keys(main_roles[main_key].actions).length === 0) {
                delete main_roles[main_key]
            }
        }
    })
    return main_roles
}
