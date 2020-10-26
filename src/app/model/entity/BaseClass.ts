export class BaseClass {
    public static haveModel: boolean = false

    public static getActions () {
        const self: any = this
        const model_actions = Object.getOwnPropertyNames(self)
            .filter((item: any) => typeof self[item] === 'function')
        // console.log('model_actions', model_actions)
        const model_actions_data: any = {}
        model_actions.forEach(action => {
            model_actions_data[action] = false
        })

        return { ...model_actions_data }
    }
}
