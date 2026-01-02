const perudni = require('./getNameFromDNI');

test('test with a existant DNI, should return dni and fullname', async () => {
  expect(
      await perudni.getNameFromDNI(3)
    )
    .toStrictEqual({
      dni: '00000003',
      fullname: 'CARLOTA MEZA DE RUIZ',
      lastname: 'MEZA',
      secondlastname: 'DE RUIZ',
      name: 'CARLOTA'
    });
});

test('test with a non existant DNI, should return error and a message', async () => {
  expect(
      await perudni.getNameFromDNI(0)
    )
    .toStrictEqual({
      dni: '00000000',
      error: 'DNI no encontrado en Padrón Electoral',
      message: 'Cant get name from that DNI'
    });
});