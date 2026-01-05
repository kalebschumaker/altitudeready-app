const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First check if there's already a session
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          // Already signed in, just proceed
          onAuthSuccess();
          return;
        }
      } catch (err) {
        // No existing session, continue with sign in
      }

      await signIn({ username: email, password: password });
      onAuthSuccess();
    } catch (err) {
      if (err.message.includes('already a signed in user')) {
        // Clear the session and try again
        try {
          await signOut();
          await signIn({ username: email, password: password });
          onAuthSuccess();
        } catch (retryErr) {
          setError(retryErr.message);
          setLoading(false);
        }
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  };
