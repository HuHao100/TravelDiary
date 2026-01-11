//项目路由配置
import Home from '../pages/home/Home'
import Login from '../pages/login/Login'
import Register from '../pages/register/Register'
import Mynotes from '../pages/mynotes/Mynotes'
import Publish from '../pages/publish/Publish.jsx'
import Layout from '../pages/Layout.jsx'
import Details from "../pages/details/Details";
import Search from '../pages/search/Search';

const routes = [
    {
        path:'/',
        element:<Layout/>,
        children:[
            {
                path:'/',
                element:<Home/>,
            },
            {
                path:'/login',
                element:<Login/>,
            },
            {
                path:'/register',
                element:<Register/>,
            },
            {
                path:'/mynotes',
                element:<Mynotes/>,
            },
            {
                path:'/publish',
                element:<Publish/>,
            },
            {
                path:'/details/:id',
                element:<Details/>
            },
            {
                path:'/search',
                element:<Search/>
            }
        ]        
    }
]

export default routes;