module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-worklets/plugin',  // ✅ 변경된 플러그인
        ],
    };
};
