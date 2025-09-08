const { data: { user } } = await supabase.auth.getUser()
console.log('last_sign_in_at →', user?.last_sign_in_at)