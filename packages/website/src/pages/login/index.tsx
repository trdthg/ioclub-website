import { FetchError } from 'ohmyfetch'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import LoginIcon from 'virtual:icons/mdi/login-variant'
import { defineComponent, ref, watch } from 'vue'
import { useRequest } from 'vue-request';
import { useRouter } from 'vue-router'

import { useNuxtApp } from '#app';
import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import LogoLink from '~/components/login/link'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
import { checkInput } from '~/utils/validator'

export default defineComponent({
	layout: 'login',
	setup() {
		const router = useRouter()
		const { i18n } = useI18n()
		const field = ref('')
		const loading = ref(false);
		const { login } = i18n.value
		watch(field, () => {
			if (checkInput(field.value, 'username') || checkInput(field.value, 'email')) {
				return
			}
			console.log('watch 不符合格式')
		})
		const try_handle = (typ: string, val: string) => {
			const v: Record<string, unknown> = {}
			v[typ] = val
			v.type = typ
			if (typ == 'username') {
				typ = 'password'
				v.type = typ
			}
			console.log(v)
			const {data, loading, run} = useRequest(() =>
				$fetch('/api/user/login', {
					method: 'POST',
					body: v,
				}), {
				manual: true,
				onError: (e, params) => {
					if (e instanceof FetchError)
						console.log('onError', e, e instanceof FetchError, e.data, params)
					else
						console.log('onError', login.errormsg.network)
					return
				},
				onSuccess: (data, param) => {
					console.log('onSucess ', 'data: ', data, 'param ', param);
					router.push('/login/password')
					// router.push(`/login/${typ}`)
				}
			})
			return {data, loading, run}
		}
		const try_next = () => {
			const typ = ['username', 'email'].find(e => checkInput(field.value, e))
			if (!typ) {
				toast(login.illegal.username, 'warning')
				return
			}
			const { run, loading: loading2 } = try_handle(typ, field.value)
			loading.value = loading2.value
			run()
		}
		return () => {
			return <div>
				<LogoLink to='/login/mfa' icon={<LoginIcon/>}>{login.loginway.eorp}</LogoLink>
				<div w:m='t-4' w:text='2xl true-gray-900' w:font='medium'>
					{login.common.login}
				</div>
				<Ninput
					placeholder='输入用户名邮箱或密码' //{login.placeholder.username}
					value={field.value}
					onChange={e => field.value = e}/>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
					{login.problem.noaccount}
					<Link to='/login/register'>
						<span w:text='light-blue-600'>{login.common.register}</span>
					</Link>
				</div>
				<div w:m='t-4' w:text='right'>
					<NButton
						disabled={loading.value}
						loading={loading.value}
						w:opacity={!loading.value ? '' : '50'}
						onClick={try_next}
					>
						{login.nextstep.nextstep}
					</NButton>
				</div>
			</div>
		}
	}
})
