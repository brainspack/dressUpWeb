import { useQuery } from '@tanstack/react-query'
import { baseApi } from '../../api/baseApi'

export const useUserQuery = (userId: string | null) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => baseApi(`/api/users/${userId}`),
        enabled: !!userId,
    })
}
