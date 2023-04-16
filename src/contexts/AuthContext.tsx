import React, {useState, createContext, ReactNode, useEffect} from "react";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextData = {
    user: UserProps
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>
    loadingAuth: boolean
    loading: boolean
    signOut: () => Promise<void>
}

type UserProps = {
    id: string;
    name: string;
    email: string;
    token: string;
}

type AuthProviderProps ={
    children: ReactNode
}

type SignInProps = {
    email: string
    password: string
}


export const AuthContext = createContext({} as AuthContextData)


export function AuthProvider({children}:AuthProviderProps){

    const [user, setUser] = useState<UserProps>({
        id: '',
        name: '',
        email: '',
        token: '',
    
    })

    const [loadingAuth, setLoadingAuth] = useState(false)
    const [loading, setLoading] = useState(true)

    const isAuthenticated = !!user.name // se não tiver o nome será falso.


    //Permanecer o usuário logado
    useEffect(()=>{
        async function getUser() {
            //Pegar dados salvos do user no async store
            const userInfo = await AsyncStorage.getItem('@sujeitopizzaria');
            let hasUser:UserProps = JSON.parse(userInfo || '{}')

            //Verificando se recebemos as informações do HasUser
            if(Object.keys(hasUser).length > 0){
                api.defaults.headers.common['Authorization'] = `Bearer ${hasUser.token}`
                //Passando de novo as informações do usuário
                setUser({
                    id: hasUser.id,
                    name: hasUser.name,
                    email: hasUser.email,
                    token: hasUser.token
                })
            }
            setLoading(false)
        }

        getUser()


    },[])
      //Finalizando a permanencia de loguin


    async function signIn({email, password}:SignInProps){
        
    setLoadingAuth(true)
    
    try{

     const response = await api.post('/session', {
        email,
        password
     })

     
     const {id,name, token} = response.data

     //para salvar no asyncStorage e preciso ser string 
     const data = {
        ...response.data
     }

     //Salvar de forma offline
     await AsyncStorage.setItem('@sujeitopizzaria', JSON.stringify(data))

     //Salvando por Default o token para todos as requicições que será necessario o token (Autenticadas)
     api.defaults.headers.common['Authorization'] = `Bearer ${token}`

     setUser(
        {
        id,
        name,
        email,
        token
        }
     )

     setLoadingAuth(false)

    }catch(err){
        console.log('Erro ao acessar', err);
        setLoadingAuth(false)
    }
        
        
    }

    async function signOut(){
        await AsyncStorage.clear()
        .then(()=>{
            setUser({
                id: '',
                name: '',
                email: '',
                token: ''
            })
        })
    }


    return(
        <AuthContext.Provider value={{user,isAuthenticated,signIn, loading, loadingAuth,signOut}}>
            {children}
        </AuthContext.Provider>
    )
}