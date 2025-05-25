import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react"
import Apis, { endpoints } from "../../configs/Apis";
import { ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Chip, List, Searchbar } from "react-native-paper";

const Home = () =>{
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buildId, setBuildId] = useState(null);
    const [q, setQ] = useState();
     const [page, setPage] = useState(1);
    const nav = useNavigation();

    const loadBuilds = async () => {
        let res = await Apis.get(endpoints['buildings']);
        setBuildings(res.data);   
    }

    const loadRooms = async () => {
        if (page > 0){
            let url = `${endpoints['rooms']}?page=${page}`;
            
            if (buildId) {
                url = `${url}&building_id=${buildId}`;
            }

            try {
            setLoading(true);
            let res = await Apis.get(url);
            setRooms([...rooms, res.data.results]);
            
            if(res.data.next === null)
                setPage(0);
            }catch{

            }finally {
                setLoading(false);
            }
        }   
    }

    useEffect(() => {
        loadBuilds();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() =>{
            loadRooms();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [page]);

    useEffect(() => {
        setPage(1);
        setRooms([]);
    }, [buildId]);

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    return (
        <SafeAreaView style={[MyStyles.container, MyStyles.p]}>

            <View style={[MyStyles.row, MyStyles.wrap]}>
                <TouchableOpacity onPress={() => setBuildId(null)}>
                    <Chip icon="label" style={MyStyles.m}>Tất cả</Chip>
                </TouchableOpacity>

                {buildings.map(b => <TouchableOpacity key={`Build${b.id}`} onPress={() => setBuildId(b.id)}>
                    <Chip icon="label" style={MyStyles.m} >{b.name}</Chip>
                </TouchableOpacity>)}
            </View>
            <Searchbar placeholder="Tìm kiếm khóa học.." value={q} onChangeText={setQ} />

            <FlatList onEndReached={loadMore} ListFooterComponent={loading && <ActivityIndicator />} data={rooms}
                      renderItem={({item}) => <List.Item key={`Rooms${item.id}`} title={item.name}
                                                    description={item.created_date}
                                                    left={() => <TouchableOpacity onPress={() => nav.navigate('roomDetails', {'RoomId': item.id})}>
                                                        <Image style={MyStyles.avatar} source={{uri: item.image}} />
                                                    </TouchableOpacity>} />} />

        </SafeAreaView>
    );
}

export default Home;