import React, {useState,useEffect} from "react";
import {SafeAreaView,View, Text, TouchableOpacity ,StyleSheet, TextInput, Modal, FlatList} from 'react-native'

import {Feather} from '@expo/vector-icons'

//Pegando parametros vindo através da navegação
import {useRoute, RouteProp,useNavigation} from '@react-navigation/native'
import { api } from "../../services/api";
import { ModalPicker } from "../../components/ModalPiker";
import { ListItem } from "../../components/ListItem";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackPromsList } from "../../routes/app.routes";


type RouteDetailParams = {
    Order: {
        number: string | number
        order_id: string
    }
}

export type CategoryProps ={
    id: string
    name: string
}

type ProductProps ={
    id: string
    name: string
}

type ItemProps = {
    id: string
    product_id: string
    name: string
    amount: string | number
}

type OrderRouteProps = RouteProp<RouteDetailParams, 'Order'>

export default function Order(){

    const route = useRoute<OrderRouteProps>();
    const navigation = useNavigation<NativeStackNavigationProp<StackPromsList>>()


    const [category, setCategory] = useState<CategoryProps[] | []>([])
    const [categorySelect, setCategorySelect] = useState<CategoryProps | undefined>()
    const [modalCategoryVisible,setModalCategoryVisible] =useState(false)

    const [products, setProducts] = useState<ProductProps[] | []>([])
    const [productSelected, setProductSelected ] = useState<ProductProps | undefined>()
    const [modalProductVisible,SetModalProductVisible]= useState(false)

    const [amout, setAmout] =useState('1')

    const [items, setItems] =useState<ItemProps[]>([])


    useEffect(()=>{
        async function loadInfo(){
            const response = await api.get('/category')

            setCategory(response.data)
            setCategorySelect(response.data[0])
        }

        loadInfo()
    },[])

    //Toda vez que mudar o category ele vai puxar da api denovo
    useEffect(()=>{
        async function loadProducts(){
            const response = await api.get('/category/product',{
                params:{
                    category_id: categorySelect?.id
                }
            })

            setProducts(response.data)
            setProductSelected(response.data[0])
            
        }

        loadProducts()
    },[categorySelect])


    async function handleCloseOrder(){
       try{

        await api.delete('/order',{
            params:{
                order_id: route.params?.order_id
            }
        })

        //Volta uma tela
        navigation.goBack()

       }catch(err){
        console.log(err);
        
       }
    }

        function handleChangeCategory(item:CategoryProps){
          setCategorySelect(item)
        }

        function handleChangeProduct(item:ProductProps){
            setProductSelected(item)
        }

        //Adicionando produto a mesa
        async function handleAdd(){
            const response = await api.post('/order/add' ,{
                order_id: route.params?.order_id,
                product_id: productSelected?.id,
                amount: Number(amout)
            })

            let data = {
                id: response.data.id,
                product_id:productSelected?.id ,
                name: productSelected?.name,
                amount: amout
            }

            setItems(oldArray => [...oldArray, data])
        }

        async function handleDeleteItem(item_id: string){
           await api.delete('/order/remove' , {
            params: {
                item_id: item_id
            }
           })

           // Apos remover da api removemos o item da lista

           let removeItem = items.filter(item => {
            return(item.id !== item_id)
           })

           setItems(removeItem)

        }

        function handleFinishOrder(){
            navigation.navigate('FinishOrder',
            {
            number: route.params?.number,
            order_id: route.params?.order_id
            })
        }

    return(

        <SafeAreaView style={style.container}>

            <View style={style.header}>
            <Text style={style.title}>Mesa {route.params.number}</Text>
            {items.length === 0 && (
                <TouchableOpacity onPress={handleCloseOrder}>
                <Feather name='trash-2' size={28} color='#FF3F4b' />
                </TouchableOpacity>
            )
                 
            }
            </View>

           {
            category.length !== 0 &&(
            <TouchableOpacity style={style.input} onPress={()=> setModalCategoryVisible(true)}>
                <Text style={{color: '#fff'}}>{categorySelect?.name}</Text>
            </TouchableOpacity>
            )
           }

           {
            products.length !== 0 &&(
            <TouchableOpacity style={style.input} onPress={()=>SetModalProductVisible(true)}>
                <Text style={{color: '#fff'}}>{productSelected?.name}</Text>
            </TouchableOpacity>
            )
           }

            <View style={style.qtdConatiner}>
                <Text style={style.qtdText}>Quantidade</Text>
                <TextInput
                     style={[style.input, {width: '60%', textAlign: 'center'}]}
                     value={amout}
                     onChangeText={setAmout}
                     placeholderTextColor='#fff'
                     keyboardType="numeric"
                />
            </View>
            <View style={style.actions}>
                <TouchableOpacity style={style.buttonAdd} onPress={handleAdd}>
                    <Text style={style.buttonText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                style={[style.button, {opacity: items.length === 0 ? 0.3 : 1 }]}
                disabled={items.length === 0}
                onPress={handleFinishOrder}
                >
                    <Text style={style.buttonText}>Avançar</Text>
                </TouchableOpacity>
            </View>

            <FlatList 
            showsVerticalScrollIndicator={false}
            style={{flex: 1, marginTop: 24}}
            data={items}
            keyExtractor={(item)=> item.id}
            renderItem={({item})=> <ListItem data={item} deleteItem={handleDeleteItem}/>}
            
            />

            <Modal
            transparent={true}
            visible={modalCategoryVisible}
            animationType="fade"
            >
            <ModalPicker 
            handleCloseModal={()=> setModalCategoryVisible(false)}
            options={category}
            selectedItem={handleChangeCategory}
            />

            </Modal>

            <Modal
            transparent={true}
            visible={modalProductVisible}
            animationType="fade"
            >
                <ModalPicker 
                handleCloseModal={()=>SetModalProductVisible(false)}
                options={products}
                selectedItem={handleChangeProduct}
                />
            </Modal>


        </SafeAreaView>
    )
}


const style = StyleSheet.create({
    container:{
    flex:1,
    backgroundColor: '#1d1d2e',
    paddingVertical: '5%',
    paddingEnd:  '4%',
    paddingStart: '4%'   
    
    },
    header:{
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        marginTop: 24

    },
    title:{
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 14
    },
    input:{
        backgroundColor: '#101026',
        borderRadius: 4,
        width: '100%',
        height: 40,
        marginBottom: 12,
        justifyContent: 'center',
        paddingHorizontal: 8,
        color: '#fff',
        fontSize: 20
    },
    qtdConatiner:{
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between'
    },
    qtdText:{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    actions:{
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    buttonAdd:{
        width: '20%',
        backgroundColor: '#3fd1ff',
        borderRadius: 4,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText:{
        color: '#101026',
        fontSize: 18,
        fontWeight: 'bold'
    },
    button:{
        width: '75%',
        backgroundColor: '#3fffa3',
        borderRadius: 4,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }

})