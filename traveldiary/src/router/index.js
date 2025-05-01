//项目路由配置
import Home from '../pages/home/Home'
// import Login from '../pages/login/Login'
import Mynotes from '../pages/mynotes/Mynotes'
import Publish from '../pages/publish/Publish.jsx'
import Layout from '../pages/Layout.jsx'
const routes = [
    {
        path:'/',
        element:<Layout/>,
        children:[
            {
                path:'/',
                element:<Home/>,
            },
            // {
            //     path:'/login',
            //     element:<Login/>,
            // },
            {
                path:'/mynotes',
                element:<Mynotes/>,
            },
            {
                path:'/publish',
                element:<Publish/>,
            }
        ]        
    }
]

export default routes;